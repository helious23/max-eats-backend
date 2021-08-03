import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from '../../common/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class MyRestaurantsInput extends PaginationInput {}

@ObjectType()
export class MyRestaurantsOutput extends PaginationOutput {
  @Field(type => [Restaurant])
  restaurants?: Restaurant[];
}
