// Mutation typeDef of GraphQL
import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

// @InputType 으로 작성시 obj 형태로 넘겨줌. @Args(createResturanInput): CreateRestaurantDto
@ArgsType() // 각각의 field 를 독립적으로 넘겨줌. @Args() 비워놓아도 됨.
export class CreateRestaurantDto {
  @Field(type => String)
  @IsString()
  name: string;

  @Field(type => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field(type => String)
  @IsString()
  address: string;

  @Field(type => String)
  @IsString()
  ownerName: string;
}
