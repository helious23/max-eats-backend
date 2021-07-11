import { MailService } from './mail.service';
import got from 'got';
import * as FormData from 'form-data';
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from '../jwt/jwt.constants';

jest.mock('got');
jest.mock('form-data');

const TEST_DOMAIN = 'test-domain';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apiKey',
            domain: TEST_DOMAIN,
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
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);

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

  describe('sendEmail', () => {
    it('should send email', async () => {
      const ok = await service.sendEmail('', '', '', [
        { key: 'key', value: 'value' },
      ]);
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      expect(formSpy).toHaveBeenCalledTimes(5);
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );
      expect(ok).toEqual(true);
    });
    it('should fail on exception', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const ok = await service.sendEmail('', '', '', []);
      expect(ok).toEqual(false);
    });
  });
});
