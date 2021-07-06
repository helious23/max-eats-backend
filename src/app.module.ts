import * as Joi from 'joi'; // JS module
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // globally env file에 접근
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
      entities: [Restaurant], // going to DB(table)
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true, // schemaFile 메모리에 저장
    }),
    RestaurantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
