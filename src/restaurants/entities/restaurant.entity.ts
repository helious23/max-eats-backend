// Query typeDef for GraphQL
import { Field, ObjectType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// @InputType({ isAbstract: true }) // dto 에 extends 할 때만 Inputtype 으로 변경
@ObjectType() // for graphQL schema
@Entity() // for typeORM to bind on DB
export class Restaurant {
  @Field(type => Number)
  @PrimaryGeneratedColumn()
  @IsNumber()
  id: number;

  @Field(type => String) // as a first argument, ReturnFunction required
  @Column()
  @IsString()
  @Length(5, 20)
  name: string;

  @Field(type => Boolean, { defaultValue: true }) // graphQL
  @Column({ default: true }) // DB
  @IsOptional() // dto : value 가 없을 수도 있음
  @IsBoolean() // dto : value 가 있다면 boolean
  isVegan: boolean;

  @Field(type => String)
  @Column()
  @IsString()
  address: string;

  @Field(type => String)
  @Column()
  @IsString()
  ownerName: string;

  @Field(type => String)
  @Column()
  @IsString()
  categoryName: string;
}
