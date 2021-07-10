import { UserService } from './users.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { JwtService } from '../jwt/jwt.service';
import { MailService } from '../mail/mail.service';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
// Record :	KEY를 속성으로, TYPE를 그 속성값의 타입으로 지정하는 새로운 타입 반환	<KEY, TYPE>

describe('UserService', () => {
  let service: UserService;
  let mailService: MailService;
  let usersRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      // testingModule 을 만들어서 provider 에 mock service 및 repository 주입
      providers: [
        UserService,
        {
          // fake user repository
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    // 이후 service, userRepository 사용 가능
    service = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    // service 자체가 define 됐는지 확인
    expect(service).toBeDefined();
  });

  // createAccount testing
  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'fake-user@test.com',
      password: 'fake-pw',
      role: 0,
    };

    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        // exists 값을 정해줌
        id: 1,
        email: 'test@test.com',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        // 결괏값 확인
        ok: false,
        error: '사용중인 이메일 입니다.',
      });
    });

    it('should creater a new user', async () => {
      // mocking
      usersRepository.findOne.mockReturnValue(undefined); // exists 가 undefind -> user does't exist
      usersRepository.create.mockReturnValue(createAccountArgs); // create 의 return value 만들어줌
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationRepository.save.mockResolvedValue({
        code: 'code',
      });

      // testing
      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1); // 함수가 한번 호출 되는지 확인
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs); // 생성되는 obj 확인
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error()); // findOne 함수 자체에 reject -> catch
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({
        ok: false,
        error: '계정을 만들지 못했습니다.',
      });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'fake-login@test.com',
      password: 'fake-pw',
    };
    it('should fail if user does not exist', async () => {
      // mocking
      usersRepository.findOne.mockResolvedValue(null); // user 로 null 을 return

      // testing
      const result = await service.login(loginArgs);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({
        ok: false,
        error: '사용자를 찾을 수 없습니다.',
      });
    });
  });
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
