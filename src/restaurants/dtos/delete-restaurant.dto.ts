import { InputType, PickType, Field } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class DeleteRestaurantDto extends PickType(
  Restaurant,
  ['id'],
  InputType,
) {
  @Field(type => Number)
  id: number;
}
