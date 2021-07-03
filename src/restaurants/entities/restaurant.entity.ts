// typeDef for GraphQL
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Restaurant {
  @Field(type => String) // as a first argument, ReturnFunction required
  name: string;
  @Field(type => Boolean, { nullable: true }) // nullable : optional
  isGood?: boolean;
}
