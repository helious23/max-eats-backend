import { Module } from '@nestjs/common';
import {
  CategoryResolver,
  DishResolver,
  ResturantResolver,
} from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './resturants.service';
import { CategoryRepository } from './repositories/category.respository';
import { Dish } from './entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository, Dish])], // forFeature : 특정 entity 를 import
  providers: [
    ResturantResolver,
    RestaurantService,
    CategoryResolver,
    DishResolver,
  ], // add in providers to inject resolver class
})
export class RestaurantsModule {}
