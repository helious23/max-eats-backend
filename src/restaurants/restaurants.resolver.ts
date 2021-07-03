import { Query, Resolver } from '@nestjs/graphql';

@Resolver() // decorator 사용으로 graphql schema 작성 할 필요 없음
export class ResturantResolver {
  @Query((returns) => Boolean) // type for GraphQL
  isPizzaGood(): boolean {
    // type for Typescript
    return true;
  }
}
