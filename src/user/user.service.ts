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
      return '이메일';
    } else if (key === 'phoneNumber') {
      return '연락처';
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
      return commonMessages.commonFail('회원가입을');
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

    //아래 소셜정보 중 하나가 저장된다. 그리고 덮어쓰기 없음.
    let userInfo;
    try {
      //토큰으로 소셜회원정보를 불러온다.
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

      //이미 가입되어 있는 회원이 있는지 소셜아이디로 검색한다.
      const findBySocialId = await this.user.findOne({
        socialId: userInfo.socialId,
      });
      //있다면 기존정보와 달라진 정보가 있는지 확인한다.
      if (findBySocialId) {
        for (let item in userInfo) {
          if (findBySocialId[item] !== userInfo[item]) {
            before.push(findBySocialId[item]);
            after.push(userInfo[item]);
          }
        }
      }

      //change가 있으면 혹시나 달라진 정보가 있나 이미 가입한적 있는지까지 확인해서
      // 업데이트만 하고 종료한다. 토큰 발행 안해도 된다.

      let userObj; //최종확정되어 저장될 유저정보가 담긴다.아래 조건문에서만 덮어쓴다.

      if (change && findBySocialId && after.length) {
        {
          for (let i in after) {
            findBySocialId[i] = after[i];
          }
          await this.user.save(findBySocialId);
          res.json(commonMessages.commonSuccess);
          return;
        }

        //이미 가입한 적이 있다면
        //가입한 정보와 지금 정보 중 바꿔야 할 정보가 있는지 확인하고
        //바뀐 정보가 있다면 그 정보가 다른 회원정보와 중복되는지 확인하고
        //이상이 없다면// 그 정보와 토큰만 발행하고 응답한다.

        //만약 바꿔야할 정보가 없다면 userobj에 기존에 찾은 정보를 넣어준다.
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
            error: '프로파일이 업데이트 됩니다. 업데이트 하시겠습니까?',
            after,
            before,
            refreshToken: String(refreshToken),
            accessToken: String(accessToken),
            iat,
          });
          return;
        }

        //만약 가입한 적이 없다면
        //이메일과 폰 번호가 중복되는지만 검사하고
        //새로  계정을 만들고 토큰 발행하고 끝낸다.
        //여기서 리프래쉬 토큰이 아이디로 발행하므로 계정만들고 리프래쉬 토큰 발행하고 다시 저장해야 한다.
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
      res.json(commonMessages.commonFail('소셜인증이 '));
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
      return commonMessages.commonFail('사용자 정보 업데이트가');
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
      return commonMessages.commonFail('인증이');
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
        error: '이메일과 휴대폰 번호만 중복 검사 할 수 있습니다.',
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
      return commonMessages.commonFail('중복확인이');
    }
  }

  async findByCondition(condition: object): Promise<User> {
    return this.user.findOne(condition);
  }

  async delRefreshToken(id) {
    return this.user.save({ id, refreshToken: null });
  }
}
