import { InputType, PickType, ObjectType, Field } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class EditOrderInput extends PickType(Order, ['id', 'status']) {}

@ObjectType()
export class EditOrderOutput extends CoreOutput {
  @Field(type => Order, { nullable: true })
  order?: Order;
}
