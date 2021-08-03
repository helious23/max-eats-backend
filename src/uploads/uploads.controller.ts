import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

const BUCKET_NAME = 'maxeats-uploads-max16';

@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file')) // name:file
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECREAT_KEY,
      },
    });
    try {
      const objectName = `${Date.now() + file.originalname}`;
      await new AWS.S3().config
        .update({ region: 'ap-northeast-2' })
        // .createBucket({
        //   Bucket: 'maxeats-uploads-max16',
        // })
        // 버킷 생성 시 한번만 실행
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
      return { url };
    } catch (error) {
      return null;
    }
  }
}
