import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { commonMessages } from 'src/common/erroeMessages';
import { Not, Repository } from 'typeorm';
import { JoinDTO, JoinOutput } from './dtos/join.dto';
import { LoginDTO, LoginOutput } from './dtos/login.dto';
import { UpdateUserDTO } from './dtos/updateUser.dto';
import { User } from './entities/user.entity';
import { RefreshTokenOutput } from './dtos/refreshToken.dto';
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
import { TripRecord } from './entities/tripRecord.entity';
import { TripRecordDTO } from './dtos/tripRecorddto';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(User) private readonly user: Repository<User>,
    @InjectRepository(PhoneAuthEntity)
    private readonly phoneAuth: Repository<PhoneAuthEntity>,
    @InjectRepository(TripRecord)
    private readonly tripRecore: Repository<TripRecord>,
  ) {}

  async saveTripRecore(user: User, data: TripRecordDTO) {
    try {
      const record = this.tripRecore.create(data);
      record.user = user;
      await this.tripRecore.save(record);
      return commonMessages.commonSuccess;
    } catch (e) {
      console.log(e);
    }
  }

  async getKakaoUserInfo(res: Response, token: string): Promise<object> {
    let data;
    try {
      data = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.log(e);
      return { ok: false };
    }

    const {
      data: {
        id,
        properties: { nickname },
        kakao_account: { email },
      },
    } = data;

    const result = {
      ok: true,
      ...(id && { socialId: id }),
      ...(nickname && { nickName: nickname }),
      ...(email && { email }),
    };
    return result;
  }

  async getNaverUserInfo(res, token) {
    let data;
    try {
      data = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      return { ok: false };
    }
    const { id, nickname, email, mobile } = data.data.response;
    const result = {
      ok: true,
      ...(id && { socialId: id }),
      ...(email && { email }),
      ...(nickname && { nickName: nickname }),
      ...(mobile && { phoneNumber: mobile.replace(/-/g, '') }),
    };

    return result;
  }

  hangleChanger(key) {
    if (key === 'email') {
      return '?????????';
    } else if (key === 'phoneNumber') {
      return '?????????';
    }
  }

  async onlyExistCheck(data: object): Promise<[string, User]> {
    for (let i in data) {
      if (i === 'phoneNumber' || i === 'email') {
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

      const beforeJoin = this.user.create(data);
      const isAuthed = await this.phoneAuth.findOne({
        phoneNumber: data.phoneNumber,
      });
      if (!isAuthed) {
        beforeJoin.verified = true;
      }
      await this.user.save(beforeJoin);

      return commonMessages.commonSuccess;
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('???????????????');
    }
  }

  async findByConditionAndConfirmExist(
    notIn: object,
    In: object,
  ): Promise<[string, User]> {
    for (let i in In) {
      if (i === 'phoneNumber' || i == 'email') {
        for (let j in notIn) {
          const exist = await this.user.findOne({
            [j]: Not(notIn[j]),
            [i]: In[i],
          });
          if (exist) {
            return [i, exist];
          }
        }
      }
      continue;
    }

    return [null, null];
  }

  async socialLoginService(
    req: Request,
    res: Response,
    { change, socialToken }: SocialDTO,
  ): Promise<SocialOutput> {
    const path = req.path.split('/').pop();
    const after = [];
    const before = [];

    //?????? ???????????? ??? ????????? ????????????. ????????? ???????????? ??????.
    let userInfo;
    try {
      //???????????? ????????????????????? ????????????.
      if (path === 'kakao') {
        userInfo = await this.getKakaoUserInfo(res, socialToken);
      } else {
        userInfo = await this.getNaverUserInfo(res, socialToken);
      }

      if (!userInfo.ok) {
        res.json(commonMessages.commonAuthFail);
        return;
      }

      delete userInfo.ok;

      //?????? ???????????? ?????? ????????? ????????? ?????????????????? ????????????.
      const findBySocialId = await this.user.findOne({
        socialId: userInfo.socialId,
      });
      //????????? ??????????????? ????????? ????????? ????????? ????????????.
      if (findBySocialId) {
        for (let item in userInfo) {
          if (findBySocialId[item] !== userInfo[item]) {
            before.push(findBySocialId[item]);
            after.push(userInfo[item]);
          }
        }
      }

      //change??? ????????? ????????? ????????? ????????? ?????? ?????? ???????????? ??????????????? ????????????
      // ??????????????? ?????? ????????????. ?????? ?????? ????????? ??????.

      let userObj; //?????????????????? ????????? ??????????????? ?????????.?????? ?????????????????? ????????????.

      if (change && findBySocialId && after.length) {
        {
          for (let i in after) {
            findBySocialId[i] = after[i];
          }
          await this.user.save(findBySocialId);
          res.json(commonMessages.commonSuccess);
          return;
        }

        //?????? ????????? ?????? ?????????
        //????????? ????????? ?????? ?????? ??? ????????? ??? ????????? ????????? ????????????
        //?????? ????????? ????????? ??? ????????? ?????? ??????????????? ??????????????? ????????????
        //????????? ?????????// ??? ????????? ????????? ???????????? ????????????.

        //?????? ???????????? ????????? ????????? userobj??? ????????? ?????? ????????? ????????????.
      } else if (findBySocialId) {
        userObj = findBySocialId;

        if (after.length) {
          const [key, exist] = await this.findByConditionAndConfirmExist(
            { socialId: userInfo.socialId },
            userInfo,
          );
          if (exist) {
            res.json(commonMessages.commonExist(this.hangleChanger(key)));
            return;
          }

          const accessToken = this.authService.sign(
            'id',
            findBySocialId['id'],
            60 * 60,
          );
          const { iat } = this.authService.verify(String(accessToken));
          const refreshToken = this.authService.sign(
            'id',
            findBySocialId['id'],
            60 * 60 * 24 * 7,
          );

          res.json({
            ok: true,
            error: '??????????????? ???????????? ?????????. ???????????? ???????????????????',
            after,
            before,
            refreshToken: String(refreshToken),
            accessToken: String(accessToken),
            iat,
          });
          return;
        }

        //?????? ????????? ?????? ?????????
        //???????????? ??? ????????? ?????????????????? ????????????
        //??????  ????????? ????????? ?????? ???????????? ?????????.
        //????????? ???????????? ????????? ???????????? ??????????????? ??????????????? ???????????? ?????? ???????????? ?????? ???????????? ??????.
      } else if (!findBySocialId) {
        const [key, exist] = await this.onlyExistCheck(userInfo);
        if (exist) {
          res.json(commonMessages.commonExist(this.hangleChanger(key)));
          return;
        }
        userObj = this.user.create(userInfo);
      } else {
      }

      const newUser = await this.user.save(userObj);
      const accessToken = this.authService.sign('id', newUser['id'], 60 * 60);
      const { iat } = this.authService.verify(String(accessToken));
      const refreshToken = this.authService.sign(
        'id',
        newUser['id'],
        60 * 60 * 24 * 7,
      );
      newUser.refreshToken = String(refreshToken);
      await this.user.save(newUser);
      res.json({
        ok: true,
        refreshToken: String(refreshToken),
        iat,
        accessToken: String(accessToken),
      });
      return;
    } catch (e) {
      console.log(e);
      res.json(commonMessages.commonFail('??????????????? '));
      return;
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
          const activeToken = this.authService.sign('id', exist.id, 60 * 60);
          const { iat } = this.authService.verify(String(activeToken));
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
            iat,
            accessToken: String(activeToken),
            refreshToken: String(refreshToken),
          };
        }
      }
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('????????????');
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
      return commonMessages.commonFail('???????????? ?????????');
    }
  }

  async updateUser(updateUser: User, data: UpdateUserDTO) {
    if (data.pwd !== data.pwdConfirm) {
      return commonMessages.commonWrongConfirmPassword;
    }

    for (let i in data) {
      updateUser[i] = data[i];
    }
    delete updateUser.pwd;

    try {
      await this.user.save(updateUser);
      return {
        ok: true,
      };
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('????????? ?????? ???????????????');
    }
  }

  async refrechToken(user: User): Promise<RefreshTokenOutput> {
    try {
      const activeToken = this.authService.sign('id', user.id, 60 * 60);
      const { iat } = this.authService.verify(String(activeToken));
      return {
        ok: true,
        iat,
        activeToken: String(activeToken),
      };
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('?????????');
    }
  }

  async confirmExist(
    loginUser: User,
    data: ConfirmExistDTO,
  ): Promise<ConfirmExistOutput> {
    for (let i in data) {
      if (i === 'email' || i == 'phoneNumber') {
        continue;
      }
      return {
        ok: false,
        error: '???????????? ????????? ????????? ?????? ?????? ??? ??? ????????????.',
      };
    }

    try {
      if (loginUser) {
        const [key, exist] = await this.findByConditionAndConfirmExist(
          { id: loginUser.id },
          data,
        );
        if (exist) {
          return commonMessages.commonExist(this.hangleChanger(key));
        }
      }

      const [key, exist] = await this.onlyExistCheck(data);
      if (exist) {
        return commonMessages.commonExist(this.hangleChanger(key));
      }
      return commonMessages.commonSuccess;
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('???????????????');
    }
  }

  async findByCondition(condition: object): Promise<User> {
    return this.user.findOne({ ...condition, relations: ['tripRecord'] });
  }

  async delRefreshToken(id) {
    return this.user.save({ id, refreshToken: null });
  }
}
