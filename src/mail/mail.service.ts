import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    this.sendEmail('testing', 'test', 'max16@naver.com');
  }

  private async sendEmail(subject: string, content: string, to: string) {
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    form.append('to', to);
    form.append('subject', subject);
    form.append('template', 'verify-email');
    form.append('v:code', '123123');
    form.append('v:username', 'Max');
    const response = await got(
      `https://api.mailgun.net/v3/${this.options.domain}/messages`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        method: 'POST',
        body: form,
      },
    );
    console.log(response.body);
  }
}
