import { Field, InputType, ObjectType, PickType, Int } from '@nestjs/graphql';
import {
  PaginationOutput,
  PaginationInput,
} from '../../common/dtos/pagination.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class GetOrderAmountInput extends PaginationInput {
  @Field(type => Int)
  restaurantId: number;
}

@ObjectType()
export class GetOrderAmountOutput extends PaginationOutput {
  @Field(type => [Order], { nullable: true })
  orders?: Order[];
}
