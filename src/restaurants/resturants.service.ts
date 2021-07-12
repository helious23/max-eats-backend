import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { User } from '../users/entities/user.entity';

@Injectable() // resolver 에 constructor 로 inject 할 수 있게 함
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) // Restaurant entity 로 repository 를 만듦
    private readonly restaurants: Repository<Restaurant>, // restaurants 라는 이름으로 Restaurant entity 를 Repository  type 으로 만듦
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '식당을 등록하지 못했습니다.',
      };
    }
  }
}
