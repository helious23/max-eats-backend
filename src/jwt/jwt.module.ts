import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';
import { CONFIG_OPTIONS } from './jwt.constants';

@Module({})
@Global() // globally 사용 가능하게 함
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
