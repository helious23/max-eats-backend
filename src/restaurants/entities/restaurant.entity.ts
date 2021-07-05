// Query typeDef for GraphQL
import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType() // for graphQL schema
@Entity() // for typeORM for binding to DB
export class Restaurant {
  @Field(type => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(type => String) // as a first argument, ReturnFunction required
  @Column()
  name: string;

  @Field(type => Boolean, { nullable: true }) // nullable : optional
  @Column()
  isVegan?: boolean;

  @Field(type => String)
  @Column()
  address: string;

  @Field(type => String)
  @Column()
  ownerName: string;

  @Field(type => String)
  @Column()
  categoryName: string;
}
