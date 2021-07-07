import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interfaces';
import { CONFIG_OPTIONS } from './jwt.constants';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions, // jwt.modules 에서 provide 로 받은 이름, 내용
  ) {
    console.log(options);
  }
  hello() {
    console.log('hello');
  }
}
