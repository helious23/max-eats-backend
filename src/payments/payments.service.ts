import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: '식당을 찾지 못했습니다',
        };
      }
      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '자신이 소유한 식당만 결제할 수 있습니다',
        };
      }

      restaurant.isPromoted = true;

      // 프로모션 기간 설정
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promoteUntil = date;
      this.restaurants.save(restaurant);

      await this.payments.save(
        this.payments.create({
          transactionId,
          user: owner,
          restaurant,
        }),
      );
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '결제를 하지 못했습니다',
      };
    }
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({ user });
      if (!payments) {
        return {
          ok: false,
          error: '구매 내역이 없습니다',
        };
      }
      return {
        ok: true,
        payments,
      };
    } catch (error) {
      return {
        ok: false,
        error: '구매 내역을 불러오지 못했습니다',
      };
    }
  }
}
