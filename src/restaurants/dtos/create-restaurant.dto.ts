import { Field, InputType, ObjectType, PickType, Int } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field(type => String)
  categoryName: string;

  @Field(type => String, { nullable: true })
  categoryImg?: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {
  @Field(type => Int, { nullable: true })
  restaurantId?: number;
}
