import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';

export class JwtMiddleware implements NestMiddleware {
  // implements : class 가 interface 처럼 작동
  use(req: Request, res: Response, next: NextFunction) {
    console.log(req.headers);
    next(); // express 와 동일하게 next() 함수 필수
  }
}
