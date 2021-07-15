import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
  Int,
} from '@nestjs/graphql';
import { Dish } from '../entities/dish.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class EditDishInput extends PickType(PartialType(Dish), [
  'name',
  'price',
  'description',
  'options',
]) {
  @Field(type => Int)
  dishId: number;
}

@ObjectType()
export class EditDishOutput extends CoreOutput {}
