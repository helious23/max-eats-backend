import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import * as Joi from 'joi'; // JS module
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // globally env file에 접근 : 필요한 module 의 import 에 ConfigService 로 접근
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod', // product 시 env 파읾 무시
      validationSchema: Joi.object({
        // env 파일 validation : 내용이 부족하면 app 실행 X
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAINGUN_API_KEY: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
        MAINGUN_DOMAIN_NAME: Joi.string().required(),
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
      logging:
        process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test', // check log. production 시에는 false
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
      ], // going to DB(table)
    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true, // 서버가 웹소켓 기능을 가지게 됨
      autoSchemaFile: true, // schemaFile 메모리에 저장
      context: ({ req, connection }) => {
        // graphQL context 로 request 의 user 를 공유
        if (req) {
          return { user: req['user'] };
        } else {
          console.log(connection);
        }
      },
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAINGUN_API_KEY,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
      domain: process.env.MAINGUN_DOMAIN_NAME,
    }),
    AuthModule,
    UsersModule,
    AuthModule,
    RestaurantsModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      //.exclude : 특정 route 만 제외함
      path: '/graphql', // 이 경로일 경우에
      method: RequestMethod.POST, // POST, GET, DELETE 등 사용할 method 지정 가능(ALL 도 가능)
    });
  }
}
