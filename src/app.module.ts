import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'max16',
      password: 'test',
      database: 'max-eats',
      synchronize: true,
      logging: true,
    }),
    RestaurantsModule,
    GraphQLModule.forRoot({
      autoSchemaFile: true, // schemaFile 메모리에 저장
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
