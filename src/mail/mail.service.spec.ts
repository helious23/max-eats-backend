import { MailService } from './mail.service';
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from '../jwt/jwt.constants';

jest.mock('got', () => {});
jest.mock('form-data', () => {
  append: jest.fn();
});

describe('MailService', () => {
  let service: MailService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apiKey',
            domain: 'test-domain',
            fromEmail: 'test-fromEmail',
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationArgs = {
        email: 'email',
        code: 'code',
      };
      // spyOn : mock fn 으로 만들 수 없을 경우 사용. sendEmail 함수를 가로채 결괏값을 변경.
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {});

      service.sendVerificationEmail(
        sendVerificationArgs.email,
        sendVerificationArgs.code,
      );

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Max Eats 회원 가입을 축하합니다.',
        'verify-email',
        sendVerificationArgs.email,
        [
          { key: 'code', value: sendVerificationArgs.code },
          { key: 'username', value: sendVerificationArgs.email },
        ],
      );
    });
  });

  it.todo('sendEmail');
});
