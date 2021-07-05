// Mutation typeDef of GraphQL
import { Field, InputType, OmitType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';
import { Restaurant } from '../entities/restaurant.entity';

// @InputType 으로 작성시 obj 형태로 넘겨줌. @Args(createResturanInput): CreateRestaurantDto
@InputType() // 각각의 field 를 독립적으로 넘겨줌. @Args() 비워놓아도 됨.
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {}
