import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { JwtService } from './jwt.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService, // users.modules 에서 exports 되었는지 확인!
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt']; // find token
      const decoded = this.jwtService.verify(token.toString()); // verify token into object
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        try {
          const user = await this.usersService.findById(decoded['id']); // making a user with id
          req['user'] = user; // request 에 user 를 보냄
        } catch (e) {
          console.log(e);
        }
      }
    }
    next(); // express 와 동일하게 next() 함수 필수
  }
}
