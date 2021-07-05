// Query typeDef for GraphQL
import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// @InputType({ isAbstract: true })
@ObjectType() // for graphQL schema
@Entity() // for typeORM to binding on DB
export class Restaurant {
  @Field(type => Number)
  @PrimaryGeneratedColumn()
  @IsNumber()
  id: number;

  @Field(type => String) // as a first argument, ReturnFunction required
  @Column()
  @IsString()
  name: string;

  @Field(type => Boolean, { nullable: true }) // nullable : optional
  @Column()
  @IsBoolean()
  isVegan?: boolean;

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
