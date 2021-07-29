import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from '../restaurants/entities/dish.entity';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import {
  PUB_SUB,
  NEW_PENDING_ORDER,
  NEW_COOKED_ORDER,
} from '../common/common.constants';
import { PubSub } from 'graphql-subscriptions';
import { NEW_ORDER_UPDATE } from '../common/common.constants';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    { resturantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(resturantId);
      if (!restaurant) {
        return {
          ok: false,
          error: '식당을 찾을 수 없습니다',
        };
      }

      // ---------------------------------- price ---------------------------------- //

      let orderFinalPrice = 0; // 최종 가격 설정
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        // dish 가 없을 경우 ok:false 를 return 하기 위해 for loop 사용(forEach X)
        // 주문의 item for loop
        const dish = await this.dishes.findOne(item.dishId); // order 의 dishId 로 메뉴 검색
        if (!dish) {
          return {
            ok: false,
            error: '메뉴를 찾을 수 없습니다',
          };
        }
        let dishFinalPrice = dish.price; // 각 메뉴의 가격 설정

        for (const itemOption of item.options) {
          // 선택된 메뉴의 옵션 for loop
          const dishOption = dish.options.find(
            // DB 의 dish 의 option
            dishOption => dishOption.name === itemOption.name, // 각각의 option 이름이 DB의 dish의 option과 일치 하는지 확인
          );
          if (dishOption) {
            if (dishOption.extra) {
              //dishoption 의 extra 비용이 있을 경우
              dishFinalPrice = dishFinalPrice + dishOption.extra; // 메뉴 가격에 extra 비용 합산
            } else {
              // option 자체에 extra 비용이 없는 경우
              const dishOptionChoice = dishOption.choices.find(
                optionChoice => optionChoice.name === itemOption.choice,
                // choice 의 이름(itemOption.choice)을 DB 의 dish의 option 이름(optionChoice)과 비교
              );

              if (dishOptionChoice) {
                // option 에 extra 가 없는 choice
                if (dishOptionChoice.extra) {
                  // choice 에 extra 가 있으면
                  dishFinalPrice = dishFinalPrice + dishOptionChoice.extra; // 메뉴 가격에 choice 의 extra 가격 합산
                }
              }
            }
          }
        }
        orderFinalPrice = orderFinalPrice + dishFinalPrice; // 최종 가격에 메뉴 가격 합산

        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }
      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );

      // ---------------------------------- subscription ---------------------------------- //

      await this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: restaurant.ownerId },
      });
      // new_pending_order 이름으로 order 를 pendingOrders subscription 의 payload로 publish
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '주문을 만들지 못했습니다',
      };
    }
  }

  async getOrders(
    user: User,
    { status, page }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    let orders: Order[];
    let totalResults: number;
    try {
      if (user.role === UserRole.Client) {
        [orders, totalResults] = await this.orders.findAndCount({
          where: {
            customer: user,
            ...(status && { status }), // input 에 status 가 있을 경우 status 가 같은 값만 find
          },
          take: 10,
          skip: (page - 1) * 10,
        });
      } else if (user.role === UserRole.Delivery) {
        [orders, totalResults] = await this.orders.findAndCount({
          where: {
            driver: user,
            ...(status && { status }), // input 에 status 가 있을 경우 status 가 같은 값만 find
          },
          take: 10,
          skip: (page - 1) * 10,
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });

        orders = restaurants
          .map(restaurant => restaurant.orders)
          .flat(1)
          .slice((page - 1) * 10, page * 10);

        if (status) {
          orders = orders.filter(order => order.status === status); // 각각의 order의 status 가 input 의 status 와 같은 경우만 filter
          totalResults = restaurants
            .map(restaurant => restaurant.orders)
            .flat(1)
            .filter(order => order.status === status).length;
        }
      }
      return {
        ok: true,
        orders,
        totalResults,
        totalPages: totalResults ? Math.ceil(totalResults / 10) : null,
      };
    } catch (error) {
      return {
        ok: false,
        error: '주문을 불러오지 못했습니다',
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    return canSee;
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
      });

      if (!order) {
        return {
          ok: false,
          error: '주문을 찾지 못했습니다',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: '주문을 확인할 수 없습니다',
        };
      }
      return {
        ok: true,
        order,
      };
    } catch (error) {
      return {
        ok: false,
        error: '주문을 불러오지 못했습니다',
      };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: '주문을 찾을 수 없습니다',
        };
      }
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: '주문을 확인할 수 없습니다',
        };
      }

      let canEdit = true;
      if (user.role === UserRole.Client) {
        canEdit = false;
      }

      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canEdit = false;
        }
      }
      if (user.role === UserRole.Delivery) {
        if (
          status !== OrderStatus.PickedUp &&
          status !== OrderStatus.Delivered
        ) {
          canEdit = false;
        }
      }
      if (!canEdit) {
        return {
          ok: false,
          error: '주문을 수정할 수 없습니다',
        };
      }

      await this.orders.save({
        // create 가 없는 save 는 변경된 entity 만 return 사용 X
        id: orderId,
        status,
      });
      const newOrder = { ...order, status };
      if (user.role === UserRole.Owner) {
        if (status === OrderStatus.Cooked) {
          await this.pubSub.publish(NEW_COOKED_ORDER, {
            coockedOrders: newOrder, // 기존 order 에 변경된 status 만 바꿔서 payload 로 전달
          });
        }
      }
      await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '주문을 수정하지 못했습니다',
      };
    }
  }

  async takeOrder(
    driver: User,
    { id: orderId }: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId);
      if (!order) {
        return {
          ok: false,
          error: '주문을 찾지 못했습니다',
        };
      }
      if (order.driver) {
        return {
          ok: false,
          error: '배송 기사님이 이미 배치 되었습니다',
        };
      }

      await this.orders.save({
        id: orderId,
        driver,
      });

      await this.pubSub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: { ...order, driver },
      });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '배달을 시작히지 못했습니다',
      };
    }
  }
}
