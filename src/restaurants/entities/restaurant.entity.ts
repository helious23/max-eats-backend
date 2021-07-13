// Query typeDef for GraphQL
import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { Category } from './category.entity';
import { User } from '../../users/entities/user.entity';

@InputType('RestaurantInputType', { isAbstract: true }) // dto 에 extends 할 때만 Inputtype 으로 변경
@ObjectType() // for graphQL schema
@Entity() // for typeORM to bind on DB
export class Restaurant extends CoreEntity {
  @Field(type => String) // as a first argument, ReturnFunction required
  @Column()
  @IsString()
  @Length(2)
  name: string;

  @Field(type => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(type => String)
  @Column()
  @IsString()
  address: string;

  @Field(type => Category, { nullable: true })
  @ManyToOne(type => Category, category => category.restaurants, {
    // 어디와 연결되어 있는지 명시, 연결된 entity 의 어느 항목인지 기재
    nullable: true, // category 가 지워져도 restaurant 는 지워지면 안됨
    onDelete: 'SET NULL', // category 가 없는 restaurant 도 있을 수 있음
  })
  category: Category;

  @Field(type => User)
  @ManyToOne(type => User, user => user.restaurants, { onDelete: 'CASCADE' })
  owner: User;

  // owner 의 id 만 가진 field를 만듦 by using @RelationId
  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;
}
