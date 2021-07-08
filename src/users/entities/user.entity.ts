import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import {
  ObjectType,
  InputType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { CoreEntity } from '../../common/entities/core.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsEnum } from 'class-validator';

enum UserRole {
  Client,
  Owner,
  Delivery,
}

registerEnumType(UserRole, { name: 'UserRole' }); // for graphQL

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field(type => String)
  @IsEmail()
  email: string;

  @Column({ select: false }) // user 객체에 password 제외
  @Field(type => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole }) // for DB (0, 1, 2)
  @Field(type => UserRole) // for graphQL
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(type => Boolean)
  verified: boolean;

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
