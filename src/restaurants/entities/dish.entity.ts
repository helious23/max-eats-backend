import { Length, IsString, IsNumber } from 'class-validator';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Field, ObjectType, InputType, Int } from '@nestjs/graphql';
import { CoreEntity } from '../../common/entities/core.entity';
import { Restaurant } from './restaurant.entity';

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  @Length(2)
  name: string;

  @Field(type => Int)
  @Column()
  @IsNumber()
  prive: number;

  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  photo: string;

  @Field(type => String)
  @Column()
  @IsString()
  @Length(5, 140)
  description: string;

  @Field(type => Restaurant, { nullable: true })
  @ManyToOne(type => Restaurant, restaurant => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;
}
