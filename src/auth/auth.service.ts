import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { commonMessages } from 'src/common/erroeMessages';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import * as sendGridMail from '@sendgrid/mail';
import { UserService } from 'src/user/user.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @InjectRepository(Auth) private readonly auth: Repository<Auth>,
  ) {}

  sign(key: string, value: string | number, exp?: number) {
    try {
      return jwt.sign(
        { [key]: value },
        this.configService.get('TOKEN_SECRET'),
        {
          expiresIn: exp,
        },
      );
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('인증이');
    }
  }

  verify(token: string) {
    try {
      return jwt.verify(token, this.configService.get('TOKEN_SECRET'));
    } catch (e) {
      return e.name;
    }
  }

  makeVerifyCode(user): Promise<Auth> {
    return this.auth.save(this.auth.create({ user }));
  }

  async sendMail(to: string, code: string) {
    const email = {
      from: this.configService.get('MY_EMAIL'),
      to,
      html: '<h1></h1>',
      template_id: 'd-f59c8dcc1fae4ab8925cf0a468ea21d4',

      dynamic_template_data: {
        code,
      },
    };
    sendGridMail.setApiKey(this.configService.get('MAIL_KEY'));
    await sendGridMail.send(email);
  }

  async confirmExist(key: string, data: object, res?: Response) {
    if (key in data) {
      const exist = await this.userService.findByCondition({
        [key]: data[key],
      });
      if (exist) {
        return () => res.json(commonMessages.commonExist(key));
      }
    }
  }
}
