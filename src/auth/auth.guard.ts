import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from './role.decorator';
import { JwtService } from '../jwt/jwt.service';
import { UserService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>( // metadata의 type
      'roles', // metadata key
      context.getHandler(), // metadata value
    ); // 'roles' 라는 metadata 를 읽어옴
    if (!roles) {
      // resolver 가 public 임
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext(); // http req 를 graphQL context 로 변경
    const token = gqlContext.token;
    if (token) {
      const decoded = this.jwtService.verify(token.toString()); // verify token into object
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { user } = await this.usersService.findById(decoded['id']); // find a user with id
        if (!user) {
          return false;
        }
        gqlContext['user'] = user; // @authUser 사용을 위해 gqlContext 에 User 정보 넣음
        if (roles.includes('Any')) {
          return true;
        }
        return roles.includes(user.role);
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
