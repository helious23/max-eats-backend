import { Module } from '@nestjs/common';
import { ResturantResolver } from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './resturants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])], // allow to import pacific feature
  providers: [ResturantResolver, RestaurantService], // add in providers for inject resolver class
})
export class RestaurantsModule {}
