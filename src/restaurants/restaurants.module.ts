import { Module } from '@nestjs/common';
import {
  CategoryResolver,
  DishResolver,
  ResturantResolver,
} from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantService } from './resturants.service';
import { CategoryRepository } from './repositories/category.repository';
import { Dish } from './entities/dish.entity';
import { RestaurantRepository } from './repositories/restaurant.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RestaurantRepository, CategoryRepository, Dish]),
  ], // forFeature : 특정 entity 를 import
  providers: [
    ResturantResolver,
    RestaurantService,
    CategoryResolver,
    DishResolver,
  ], // add in providers to inject resolver class
})
export class RestaurantsModule {}
