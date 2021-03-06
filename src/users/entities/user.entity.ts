import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import {
  ObjectType,
  InputType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { CoreEntity } from '../../common/entities/core.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Order } from '../../orders/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' }); // for graphQL

@InputType('UserInputType', { isAbstract: true }) // for graphQL
@ObjectType() // for graphQL
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field(type => String) // for graphQL
  @IsEmail()
  email: string;

  @Column({ select: false }) // user 객체에 password 제외
  @Field(type => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole }) // for DB
  @Field(type => UserRole) // for graphQL
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(type => Boolean)
  @IsBoolean()
  verified: boolean;

  @Field(type => [Restaurant])
  @OneToMany(type => Restaurant, restaurant => restaurant.owner)
  restaurants: Restaurant[];

  @Field(type => [Order])
  @OneToMany(type => Order, order => order.customer)
  orders: Order[];

  @Field(type => [Order])
  @OneToMany(type => Order, order => order.driver)
  rides: Order[];

  @Field(type => [Payment])
  @OneToMany(type => Payment, payment => payment.user)
  payments: Payment[];

  @BeforeInsert() // user create 이 후 save 전에 실행
  @BeforeUpdate() // editProfile 시에도 hash
  async hashPassword(): Promise<void> {
    if (this.password) {
      // password 가 있을 때에만 실행
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
