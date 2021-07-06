// Mutation typeDef of GraphQL
import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

// @ArgsType() 각각의 field 를 독립적으로 넘겨줌. @Args() 비워놓아도 됨.
@InputType() // @InputType() : obj 형태로 넘겨줌. @Args(이름): 타입
export class CreateRestaurantDto extends OmitType(
  // entity 에서 extends
  Restaurant,
  ['id'], // id field 만 omit
  InputType, // ObjectType 을 InputType 으로 변경
) {}
