import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { commonMessages } from 'src/common/erroeMessages';
import { LessThan, Repository } from 'typeorm';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import { PhoneAuthDTO, PhoneAuthOutput } from './dtos/phoneAuth.dto';
import { PhoneAuthEntity } from './entities/phoneAuth.entity';
import { PhoneConfirmDTO } from './dtos/phoneConfirm.dto';
import { Interval } from '@nestjs/schedule';
import { User } from 'src/user/entities/user.entity';
import { FindPasswordDTO, FindPasswordOutput } from './dtos/findPassword.dto';
import { TempTokenDTO, TempTokenOutput } from './dtos/tempToken.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(PhoneAuthEntity)
    private readonly phoneAuth: Repository<PhoneAuthEntity>,
    @InjectRepository(User) private readonly user: Repository<User>,
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

  async forPasswordPhone({
    phoneNumber,
    email,
  }: FindPasswordDTO): Promise<FindPasswordOutput> {
    try {
      const exist = await this.user.findOne({ email });

      if (!exist) {
        return commonMessages.commonNotFuond('등록되지 않은 이메일 입니다.');
      }

      let phoneCodeAuth = await this.phoneAuth.findOne({ phoneNumber });
      if (!phoneCodeAuth) {
        phoneCodeAuth = this.phoneAuth.create({
          phoneNumber,
        });
      }

      await this.phoneAuth.delete({ user: exist });

      phoneCodeAuth.user = exist;
      const phoneAuthCode = await this.phoneAuth.save(phoneCodeAuth);
      await this.sendPhoneAuthNumber(phoneNumber, phoneAuthCode.code);

      return commonMessages.commonSuccess;
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('휴대폰 인증이');
    }
  }

  async phone({ phoneNumber }: PhoneAuthDTO): Promise<PhoneAuthOutput> {
    try {
      let exist = await this.phoneAuth.findOne({ phoneNumber });
      if (!exist) {
        exist = this.phoneAuth.create({ phoneNumber });
      }

      const phoneAuthCodeObj = await this.phoneAuth.save(exist);
      await this.sendPhoneAuthNumber(phoneNumber, phoneAuthCodeObj.code);
      return commonMessages.commonSuccess;
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('휴대폰 인증이');
    }
  }

  async phoneConfirm({ code, phoneNumber }: PhoneConfirmDTO) {
    try {
      const exist = await this.phoneAuth.findOne({ phoneNumber, code });
      if (!exist) {
        return commonMessages.commonAuthFail;
      }
      await this.phoneAuth.delete({ id: exist.id });
      return commonMessages.commonSuccess;
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('휴대폰 인증이');
    }
  }

  async tempToken({
    email,
    code,
    phoneNumber,
  }: TempTokenDTO): Promise<TempTokenOutput> {
    try {
      const currentUser = await this.user.findOne({ email });

      if (!currentUser) {
        return commonMessages.commonAuthFail;
      }

      const exist = await this.phoneAuth.findOne({
        code,
        phoneNumber,
        user: currentUser,
      });

      if (!exist) {
        return commonMessages.commonAuthFail;
      }

      await this.phoneAuth.delete({ id: exist.id });
      const activeToken = this.sign('id', currentUser.id, 60 * 10);
      const { lat } = this.verify(String(activeToken));

      return {
        lat,
        ok: true,
        activeToken: String(activeToken),
      };
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('휴대폰 인증이');
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
  }

  @Interval(60 * 1000 * 5)
  async deleteAfterFiveMInAuthPhone() {
    console.log('delete');
    await this.phoneAuth.delete({
      createdAt: LessThan(new Date(+new Date() + 60 * 1000 * 5)),
    });
  }

  async getSocialUserInfo(token) {
    const data = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        authorization: `Bearer ${token}`,
      },
    });

    const {
      data: {
        id,
        properties: { nickname },
        kakao_account: { email },
      },
    } = data;
  }
}
