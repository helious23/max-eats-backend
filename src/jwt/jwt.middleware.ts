import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { JwtService } from './jwt.service';
import { UserService } from '../users/users.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  // implements : class 가 interface 의 모든 인자를 가져야 함
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService, // users.modules 에서 exports 되었는지 확인!
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt']; // find token
      try {
        const decoded = this.jwtService.verify(token.toString()); // verify token into object
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          const { ok, user } = await this.usersService.findById(decoded['id']); // find a user with id
          if (ok) {
            req['user'] = user;
          } // request 에 user 를 보냄
        }
      } catch (e) {
        console.log(e);
      }
    }
    next(); // express 와 동일하게 next() 함수 필수
  }
}
