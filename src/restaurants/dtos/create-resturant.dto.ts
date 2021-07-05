// Mutation typeDef of GraphQL
import { ArgsType, Field } from '@nestjs/graphql';

// @InputType 으로 작성시 obj 형태로 넘겨줌. @Args(createResturanInput): CreateResturantDto
@ArgsType() // 각각의 field 를 독립적으로 넘겨줌. @Args() 비워놓아도 됨.
export class CreateResturantDto {
  @Field(type => String)
  name: string;
  @Field(type => Boolean)
  isVegan: boolean;
  @Field(type => String)
  address: string;
  @Field(type => String)
  ownerName: string;
}
