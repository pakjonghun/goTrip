import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { commonMessages } from 'src/common/erroeMessages';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import * as sendGridMail from '@sendgrid/mail';
import { UserService } from 'src/user/user.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Response } from 'express';

import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import { PhoneAuthDTO, PhoneAuthOutput } from './dtos/phoneAuth.dto';
import { PhoneAuthEntity } from './entities/phoneAuth.entity';
import { PhoneConfirmDTO } from './dtos/phoneConfirm.dto';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @InjectRepository(Auth) private readonly auth: Repository<Auth>,
    @InjectRepository(PhoneAuthEntity)
    private readonly phoneAuth: Repository<PhoneAuthEntity>,
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

  async phone({ phoneNumber }: PhoneAuthDTO): Promise<PhoneAuthOutput> {
    //인증번호 생성
    const verifyCode = Math.floor(Math.random() * (999999 - 100000)) + 100000;

    try {
      let exist = await this.phoneAuth.findOne({ phoneNumber });

      if (!exist) {
        exist = await this.phoneAuth.save(
          this.phoneAuth.create({ code: verifyCode, phoneNumber }),
        );
      }

      exist.code = verifyCode;
      await this.phoneAuth.save(exist);

      return this.sendPhoneAuthNumber(phoneNumber, verifyCode);
    } catch (e) {
      return commonMessages.commonAuthFail;
    }
  }

  async phoneConfirm({ code, phoneNumber }: PhoneConfirmDTO) {
    try {
      const result = await this.phoneAuth.findOne({ code, phoneNumber });
      if (!result) {
        return commonMessages.commonAuthFail;
      }
      await this.phoneAuth.delete(result.id);
      return commonMessages.commonSuccess;
    } catch (e) {
      console.log(e);
      return commonMessages.commonAuthFail;
    }
  }

  async sendPhoneAuthNumber(phoneNumber: string, verifyCode: number) {
    const date = Date.now().toString();
    const uri = this.configService.get('NCP_serviceID');
    const secretKey = this.configService.get('NCP_secretKey');
    const accessKey = this.configService.get('NCP_accessKey');
    const method = 'POST';
    const space = ' ';
    const newLine = '\n';
    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
    const url2 = `/sms/v2/services/${uri}/messages`;
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
    hmac.update(method);
    hmac.update(space);
    hmac.update(url2);
    hmac.update(newLine);
    hmac.update(date);
    hmac.update(newLine);
    hmac.update(accessKey);

    const hash = hmac.finalize();
    const signature = hash.toString(CryptoJS.enc.Base64);
    try {
      const response = await axios({
        method,
        url,

        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-iam-access-key': accessKey,
          'x-ncp-apigw-timestamp': date,
          'x-ncp-apigw-signature-v2': signature,
        },
        data: {
          type: 'SMS',
          contentType: 'COMM',
          countryCode: '82',
          from: this.configService.get('hostPhoneNumber'),
          content: `[본인 확인] 인증번호 [${verifyCode}]를 입력해주세요.`,
          messages: [
            {
              to: `${phoneNumber}`,
            },
          ],
        },
      });

      if (response.data['statusCode'] < 400) {
        return commonMessages.commonSuccess;
      } else {
        return commonMessages.commonAuthFail;
      }
    } catch (e) {
      console.log(e);
      return commonMessages.commonAuthFail;
    }

    // .then((response) => {
    //   response.data
    //     ? Swal.fire({
    //         icon: 'success',
    //         title: '인증번호가 전송되었습니다.',
    //         showConfirmButton: false,
    //         timer: 1400,
    //       })
    //     : Swal.fire({
    //         icon: 'error',
    //         title: '인증요청이 실패되었습니다.',
    //         showConfirmButton: false,
    //         timer: 1400,
    //       });
    //   return commonMessages.commonSuccess;
    // })
    // .catch((err) => {
    //   console.log(err);
    //   return commonMessages.commonFail('휴대폰 인증이');
    // });
  }

  @Interval(60 * 1000 * 5)
  async deleteAfterFiveMInAuthPhone() {
    console.log('delete');
    await this.phoneAuth.delete({
      createdAt: LessThan(new Date(+new Date() + 60 * 1000 * 5)),
    });
  }
}
