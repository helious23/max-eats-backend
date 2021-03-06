import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  async sendEmail(
    subject: string, // 제목
    template: string, // mailgun template name
    to: string, // mail 수신자
    emailVars: EmailVar[], // mailgun temaplate 의 variable : username, code
  ): Promise<boolean> {
    const form = new FormData();
    form.append('from', `Max from Max Eats <mailgun@${this.options.domain}>`);
    form.append('to', 'max16@naver.com');
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));

    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Max Eats 회원 가입을 축하합니다.', 'verify-email', email, [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
