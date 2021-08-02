import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaginationInput } from '../../common/dtos/pagination.dto';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@ObjectType()
export class MyRestaurantsOutput extends CoreOutput {
  @Field(type => [Restaurant])
  restaurants?: Restaurant[];
}
