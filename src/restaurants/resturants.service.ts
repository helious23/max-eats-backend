import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { DeleteRestaurantDto } from './dtos/delete-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';

@Injectable() // resolver 에 constructor 로 inject 할 수 있게 함
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) // Restaurant entity 로 repository 를 만듦
    private readonly restaurants: Repository<Restaurant>, // restaurants 라는 이름으로 Restaurant entity 를 Repository type 으로 만듦
  ) {}

  getAll(): Promise<Restaurant[]> {
    // find 가 async method 이므로 Promise type 설정
    return this.restaurants.find(); // data mapper pattern 으로 DB에 접근 가능
  }
  getOne(id: number): Promise<Restaurant> {
    return this.restaurants.findOne(id);
  }

  createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    // save return Promise
    const newRestaurant = this.restaurants.create(createRestaurantDto); // create
    return this.restaurants.save(newRestaurant); // save on DB
  }

  deleteRestaurant({ id }: DeleteRestaurantDto) {
    return this.restaurants.delete(id);
  }

  updateRestaurant({ id, data }: UpdateRestaurantDto) {
    return this.restaurants.update(id, { ...data });
  }
}
