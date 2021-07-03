import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class ResturantResolver {
  @Query((returns) => Boolean) // type for GraphQL
  isPizzaGood(): boolean {
    // type for Typescript
    return true;
  }
}
