import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './resturants.service';
import { DeleteRestaurantDto } from './dtos/delete-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';

@Resolver(of => Restaurant) // decorator 사용으로 graphql schema 작성 할 필요 없음
export class ResturantResolver {
  constructor(private readonly restaurantService: RestaurantService) {} // inject restaurantService

  @Query(returns => [Restaurant])
  resturants(): Promise<Restaurant[]> {
    // getAll 의 find 가 async method 이므로 Promise type 설정
    return this.restaurantService.getAll();
  }

  @Query(returns => Restaurant)
  resturant(@Args('id') id: number): Promise<Restaurant> {
    return this.restaurantService.getOne(id);
  }
  @Mutation(retuns => Boolean)
  async createRestaurant(
    @Args('input') createRestaurantDto: CreateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation(returns => Boolean)
  async deleteRestaurant(
    @Args('input') deleteRestaurantDto: DeleteRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.deleteRestaurant(deleteRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation(returns => Boolean)
  async updateResturant(
    @Args('input') updateResturantDto: UpdateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.updateRestaurant(updateResturantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
