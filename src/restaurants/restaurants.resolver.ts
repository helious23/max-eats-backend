import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateResturantDto } from './dtos/create-resturant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './resturants.service';

@Resolver(of => Restaurant) // decorator 사용으로 graphql schema 작성 할 필요 없음
export class ResturantResolver {
  constructor(private readonly restaurantService: RestaurantService) {} // import restaurantService

  @Query(returns => [Restaurant])
  resturants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(retuns => Boolean)
  createResturant(@Args() createResturantDto: CreateResturantDto): boolean {
    console.log(createResturantDto);
    return true;
  }
}
