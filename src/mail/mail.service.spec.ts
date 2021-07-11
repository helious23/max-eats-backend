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

  it.todo('sendEmail');
  it.todo('sendVerificationEmail');
});