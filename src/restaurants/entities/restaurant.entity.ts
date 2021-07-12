// Query typeDef for GraphQL
import { Field, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { Category } from './categiry.entity';

// @InputType({ isAbstract: true }) // dto 에 extends 할 때만 Inputtype 으로 변경
@ObjectType() // for graphQL schema
@Entity() // for typeORM to bind on DB
export class Restaurant extends CoreEntity {
  @Field(type => String) // as a first argument, ReturnFunction required
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(type => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(type => String)
  @Column()
  @IsString()
  address: string;

  @Field(type => Category)
  @ManyToOne(type => Category, category => category.restaurants)
  category: Category;
}
