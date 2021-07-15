import { Field, InputType, ObjectType, Int, PickType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class CreateOrderInput extends PickType(Order, ['items']) {
  @Field(type => Int)
  resturantId: number;
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
