import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { commonMessages } from 'src/common/erroeMessages';
import { Repository } from 'typeorm';
import { JoinDTO, JoinOutput } from './dtos/join.dto';
import { LoginDTO, LoginOutput } from './dtos/login.dto';
import { UpdateUserDTO } from './dtos/updateUser.dto';
import { User } from './entities/user.entity';
import { RefreshTokenDTO } from './dtos/refreshToken.dto';
import { ConfirmExistDTO, ConfirmExistOutput } from './dtos/confirmExist.dto';
import axios from 'axios';
import { PhoneAuthEntity } from 'src/auth/entities/phoneAuth.entity';
import { SocialDTO, SocialOutput } from './dtos/socialLogin.dto';
import { Request } from 'express-serve-static-core';
import { Response } from 'express';
import {
  ChangePasswordDTO,
  ChangePasswordOutput,
} from './dtos/changePassword.dto';
import * as qs from 'qs';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(User) private readonly user: Repository<User>,
    @InjectRepository(PhoneAuthEntity)
    private readonly phoneAuth: Repository<PhoneAuthEntity>,
  ) {}

  async getKakaoUserInfo(res: Response, token: string): Promise<object> {
    let data;
    try {
      data = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: qs.stringify({
          'content-type': 'application/x-www-form-urlencoded',
          authorization: `Bearer ${token}`,
        }),
      });
    } catch (e) {
      console.log(e);
      return res.json(commonMessages.commonFail('카카오 소셜 인증이 '));
    }

    const {
      data: {
        id,
        properties: { nickname },
        kakao_account: { email },
      },
    } = data;

    const result = {
      ...(id && { socialId: id }),
      ...(nickname && { nickName: nickname }),
      ...(email && { email }),
    };
    return result;
  }

  async getNaverUserInfo(res, token): Promise<object> {
    let data;
    try {
      data = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.log(e);
      return res.json(commonMessages.commonFail('네이버 소셜 인증이 '));
    }

    const {
      ok,
      userInfo: { id, nickname, email, mobile },
    } = data.data.response;

    if (!ok) return ok;

    const result = {
      ...(id && { socialId: id }),
      ...(email && { email }),
      ...(nickname && { nickName: nickname }),
      ...(mobile && { phoneNumber: mobile }),
    };

    return result;
  }

  hangleChanger(key) {
    if (key === 'email') {
      return '이메일';
    } else if (key === 'phoneNumber') {
      return '연락처';
    }
  }

  async onlyExistCheck(data: object): Promise<[string, User]> {
    for (let i in data) {
      if (i === 'phoneNumber' || i === 'socialId' || i === 'email') {
        const exist = await this.user.findOne(
          { [i]: data[i] },
          { select: ['id', 'email', 'pwd', 'nickName', 'phoneNumber'] },
        );

        if (exist) {
          return [i, exist];
        }
      }
      continue;
    }
    return [null, null];
  }

  async join(data: JoinDTO): Promise<JoinOutput> {
    try {
      if (data.pwd !== data.pwdConfirm) {
        return commonMessages.commonWrongConfirmPassword;
      }

      const [key, exist] = await this.onlyExistCheck(data);
      if (exist) {
        return commonMessages.commonExist(this.hangleChanger(key));
      }

      await this.user.save(this.user.create(data));
      return commonMessages.commonSuccess;
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('회원가입을');
    }
  }

  async socialLoginService(
    req: Request,
    res: Response,
    { change, socialToken }: SocialDTO,
  ): Promise<SocialOutput> {
    const path = req.path.split('/').pop();
    const after = [];
    const before = [];
    let userInfo;

    if (path === 'kakao') {
      userInfo = await this.getKakaoUserInfo(res, socialToken);
    } else {
      userInfo = await this.getNaverUserInfo(res, socialToken);
    }
    console.log(userInfo);
    try {
      const [key, exist] = await this.onlyExistCheck(userInfo);

      if (key === 'socialId') {
        for (let item in userInfo) {
          if (exist[item] !== userInfo[item]) {
            before.push(exist[item]);
            after.push(userInfo[item]);
          }
        }
      }
      if (exist) {
        return commonMessages.commonExist(this.hangleChanger(key));
      }

      const accessToken = this.authService.sign(
        'nickName',
        userInfo['nickName'],
        60 * 60,
      );
      const refreshToken = this.authService.sign(
        'nickName',
        userInfo['nickName'],
        60 * 60 * 24 * 7,
      );

      let userObj;

      if (change) {
        after.splice(after.length);
        userObj = exist;

        for (let i in userInfo) {
          userObj[i] = userInfo[i];
        }
      } else {
        userObj = this.user.create(userInfo);
      }

      userObj['refreshToken'] = String(refreshToken);

      await this.user.save(this.user.create(userInfo));

      return {
        ok: true,
        ...(after.length && {
          error: '프로파일이 업데이트 됩니다. 업데이트 하시겠습니까?',
        }),
        ...(after.length && { after }),
        ...(after.length && { before }),
        refreshToken: String(refreshToken),
        accessToken: String(accessToken),
      };
    } catch (e) {
      console.log(e);
    }
  }

  async login({ email, pwd }: LoginDTO): Promise<LoginOutput> {
    try {
      const [key, exist] = await this.onlyExistCheck({ email });

      if (!exist) {
        return commonMessages.commonLoginFail;
      }

      if (exist) {
        const passwordCorrect = await exist.checkPassword(pwd);
        if (!passwordCorrect) {
          return commonMessages.commonLoginFail;
        }

        if (passwordCorrect) {
          const activeToken = this.authService.sign(
            'nickName',
            exist.nickName,
            60 * 60,
          );
          const refreshToken = this.authService.sign(
            'id',
            exist.id,
            60 * 60 * 24 * 7,
          );

          exist['refreshToken'] = String(refreshToken);
          delete exist.pwd;
          await this.user.save(exist);

          return {
            ok: true,
            accessToken: String(activeToken),
            refreshToken: String(refreshToken),
          };
        }
      }
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('로그인이');
    }
  }

  async changePassword(
    user,
    { pwd, pwdConfirm }: ChangePasswordDTO,
  ): Promise<ChangePasswordOutput> {
    if (pwd !== pwdConfirm) {
      return commonMessages.commonWrongConfirmPassword;
    }
    try {
      user.pwd = pwd;
      await this.user.save(user);

      return commonMessages.commonSuccess;
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('비밀번호 변경이');
    }
  }

  async updateUser(updateUser: User, data: UpdateUserDTO) {
    let activeToken;
    if (data.pwd !== data.pwdConfirm) {
      return commonMessages.commonWrongConfirmPassword;
    }
    try {
      for (let i in data) {
        updateUser[i] = data[i];
        if (i === 'nickName') {
          activeToken = this.authService.sign('nickName', data[i], 60 * 60);
        }
      }
      delete updateUser.pwd;
      await this.user.save(updateUser);
      return {
        ok: true,
        activeToken: String(activeToken),
      };
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('사용자 정보 업데이트가');
    }
  }

  async refrechToken(user: User, data: RefreshTokenDTO) {
    try {
      const activeToken = this.authService.sign(
        'nickName',
        user.nickName,
        60 * 60,
      );
      return {
        ok: true,
        activeToken,
      };
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('인증이');
    }
  }

  async confirmExist(
    user: User,
    data: ConfirmExistDTO,
  ): Promise<ConfirmExistOutput> {
    try {
      const [key, exist] = await this.onlyExistCheck(data);
      if (exist) {
        return commonMessages.commonExist(this.hangleChanger(key));
      }
      return commonMessages.commonSuccess;
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('중복확인이');
    }
  }

  async findByCondition(condition: object): Promise<User> {
    return this.user.findOne(condition);
  }

  async deleteToken(id) {
    return this.user.save({ id, refreshToken: null });
  }
}
