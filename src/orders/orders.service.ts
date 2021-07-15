import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from '../restaurants/entities/dish.entity';

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
    private readonly dishes: Repository<OrderItem>,
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
          error: '식당을 찾지 못했습니다',
        };
      }
      items.forEach(async item => {
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          // abort this whole thing
        }
        await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
      });
      // const order = await this.orders.save(
      //   this.orders.create({
      //     customer,
      //     restaurant,
      //   }),
      // );
      // console.log(order);
    } catch (error) {
      return {
        ok: false,
        error: '주문을 만들지 못했습니다',
      };
    }
  }
}
