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
      for (const item of items) {
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          return {
            ok: false,
            error: '메뉴를 찾을 수 없습니다',
          };
        }
        console.log(`Dish Price: ${dish.price}`);

        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            dishOption => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              console.log(`$USD + ${dishOption.extra}`);
            } else {
              const dishOptionChoice = dishOption.choices.find(
                optionChoice => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  console.log(`$USD + ${dishOptionChoice.extra}`);
                }
              }
            }
          }
        }
        // await this.orderItems.save(
        //   this.orderItems.create({
        //     dish,
        //     options: item.options,
        //   }),
        // );
      }
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
        error: '주문을 만들수 없습니다',
      };
    }
  }
}
