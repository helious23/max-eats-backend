import * as Joi from 'joi'; // JS module
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // globally env file에 접근 : 필요한 module 의 import 에 ConfigService 로 접근
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod', // product 시 env 파읾 무시
      validationSchema: Joi.object({
        // env 파일 validation : 내용이 부족하면 app 실행 X
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        SECRET_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD, // not required on localhost
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod', // auto migration. production 시에는 false
      logging: process.env.NODE_ENV !== 'prod', // check log. production 시에는 false
      entities: [User], // going to DB(table)
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true, // schemaFile 메모리에 저장
    }),
    JwtModule.forRoot(),
    UsersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
