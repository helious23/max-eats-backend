import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsString, Length } from 'class-validator';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { Category } from './category.entity';
import { User } from '../../users/entities/user.entity';
import { Dish } from './dish.entity';
import { OneToMany } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

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

  @Field(type => [Order])
  @OneToMany(type => Order, order => order.restaurant)
  orders: Order[];

  // owner 의 id 만 가진 field를 만듦 by using @RelationId
  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(type => [Dish])
  @OneToMany(type => Dish, dish => dish.restaurant)
  menu: Dish[];

  @Field(type => Boolean)
  @Column({ default: false }) // 기존 레스토랑이 있으므로 default 를 false 로 설정해야 에러 X
  @IsBoolean()
  isPromoted: boolean;

  @Field(type => Date, { nullable: true })
  @Column({ nullable: true })
  @IsDate()
  promoteUntil?: Date;
}
