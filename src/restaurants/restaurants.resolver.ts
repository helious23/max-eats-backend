import { Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';

@Resolver() // decorator 사용으로 graphql schema 작성 할 필요 없음
export class ResturantResolver {
  @Query(returns => Restaurant)
  myResturant() {
    return true;
  }
}
