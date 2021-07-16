import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from '../restaurants/entities/dish.entity';
import { cloneSubschemaConfig } from 'graphql-tools';

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

      let orderFinalPrice = 0; // 최종 가격 설정
      const orderItems: OrderItem[] = [];

      for (const item of items) {
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
}
