import { Module } from '@nestjs/common';
import { ResturantResolver } from './restaurants.resolver';

@Module({
  providers: [ResturantResolver],
})
export class RestaurantsModule {}
