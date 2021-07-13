import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { User } from '../users/entities/user.entity';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';

@Injectable() // resolver 에 constructor 로 inject 할 수 있게 함
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) // Restaurant entity 로 repository 를 만듦
    private readonly restaurants: Repository<Restaurant>, // restaurants 라는 이름으로 Restaurant entity 를 Repository  type 으로 만듦
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async getOrCreateCategory(name: string): Promise<Category> {
    const categoryName = name
      .trim() // 앞 뒤 공백 제거
      .toLowerCase(); // 소문자로 변환
    const categorySlug = categoryName.replace(/ /g, '-'); // 중간 스페이스를 - 로 변환
    let category = await this.categories.findOne({ slug: categorySlug });
    if (!category) {
      category = await this.categories.save(
        this.categories.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.getOrCreateCategory(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '식당을 등록하지 못했습니다',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editResturantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        editResturantInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: '식당을 찾을 수 없습니다',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: '자신이 등록한 식당만 수정할 수 있습니다',
        };
      }

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: '식당을 수정할 수 없습니다',
      };
    }
  }
}
