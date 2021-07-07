import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext(); // http req 를 graphQL context 로 변경
    const user = gqlContext['user'];
    if (!user) {
      return false;
    }
    return true;
  }
}
