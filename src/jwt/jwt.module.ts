import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';
import { CONFIG_OPTIONS } from '../common/common.constants';

@Module({})
@Global() // module 에 주입시 import 하지 않아도 사용 가능
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        {
          provide: CONFIG_OPTIONS, // jwtservice 에서 inject 할 이름
          useValue: options, // 내용
        },
        JwtService,
      ],
      exports: [JwtService],
    };
  }
}
