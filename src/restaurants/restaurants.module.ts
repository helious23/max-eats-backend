import { Module } from '@nestjs/common';
import { ResturantResolver } from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './resturants.service';
import { CategoryRepository } from './repositories/category.respository';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])], // forFeature : 특정 entity 를 import
  providers: [ResturantResolver, RestaurantService], // add in providers to inject resolver class
})
export class RestaurantsModule {}
