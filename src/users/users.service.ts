import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { JwtService } from '../jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: '사용중인 이메일 입니다' };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );

      // verification
      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );

      // send email
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: '계정을 만들지 못했습니다' };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] }, // user.entity 의 password : { select:false } 이므로 구체적으로 명시 필요
      );
      if (!user) {
        return {
          ok: false,
          error: '사용자를 찾을 수 없습니다',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: '비밀번호가 틀렸습니다',
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: '로그인하지 못했습니다',
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
        ok: true,
        user: user,
      };
    } catch (error) {
      return { ok: false, error: '사용자를 찾을 수 없습니다' };
    }
  }
  // 실제 서비스 구현시 프로필 수정과 패스워드 변경을 분리하여 관리 하는 것이 더 편할듯
  // 패스워드 변경 시 기존 패스워드 확인 및 새로운 패스워드 validation 도 구현
  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (email) {
        // unit testing 추가
        if (user.email === email) {
          return {
            ok: false,
            error: '동일한 이메일로는 변경할 수 없습니다',
          };
        }
        const existUser = await this.users.findOne({
          where: {
            email,
          },
        });
        if (existUser?.email === email) {
          return {
            ok: false,
            error: '사용중인 이메일 입니다',
          };
        }
        user.email = email;
        user.verified = false;

        // 기존의 verification 삭제
        await this.verifications.delete({ user: { id: user.id } });

        // 새로운 verification 생성
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        if (user.password === password) {
          return {
            ok: false,
            error: '동일한 비밀번호로는 변경할 수 없습니다',
          };
        }
        user.password = password;
      }
      await this.users.save(user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: '프로필을 업데이트 하지 못했습니다' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] }, // loadRelationIds:true : relationship 이 있는 id 만 가지고 옴
      );
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: '인증되지 않았습니다' };
    } catch (error) {
      return { ok: false, error: '이메일을 인증하지 못했습니다' };
    }
  }
}
