import { Field, InputType, ObjectType, Int, PickType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Order } from '../entities/order.entity';
import { DishOption } from '../../restaurants/entities/dish.entity';

@InputType()
class CreateOrderItemInput {
  @Field(type => Int)
  dishId: number;

  @Field(type => [DishOption], { nullable: true })
  options?: DishOption[];
}

@InputType()
export class CreateOrderInput {
  @Field(type => Int)
  resturantId: number;

  @Field(type => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
