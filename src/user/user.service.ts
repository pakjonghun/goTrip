import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Auth } from 'src/auth/entities/auth.entity';
import { commonMessages } from 'src/common/erroeMessages';
import { Not, Repository } from 'typeorm';
import { AuthDTO, AuthOutput } from './dtos/auth.dto';
import { FindPasswordDTO, FindPasswordOutput } from './dtos/findPassword.dto';
import { JoinDTO, JoinOutput } from './dtos/join.dto';
import { LoginDTO } from './dtos/login.dto';
import { UpdateUserDTO } from './dtos/updateUser.dto';
import { User } from './entities/user.entity';
import * as uuid from 'uuid';
import { RefreshTokenDTO } from './dtos/refreshToken.dto';
import { ConfirmExistDTO, ConfirmExistOutput } from './dtos/confirmExist.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(User) private readonly user: Repository<User>,
    @InjectRepository(Auth) private readonly auth: Repository<Auth>,
  ) {}

  async join(data: JoinDTO): Promise<JoinOutput> {
    try {
      const newUser = await this.registerUser(data);
      if (newUser.email) {
        const verify = await this.authService.makeVerifyCode(newUser);
        await this.authService.sendMail(newUser.email, verify.code);
      }
      return {
        ok: true,
        ...(data.email && {
          message: '가입한 이메일로 인증번호가 발송되었습니다.',
        }),
      };
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('회원가입이');
    }
  }

  async login({ email, pwd }: LoginDTO) {
    try {
      const userExist = await this.user.findOne(
        { email },
        { select: ['pwd', 'nickName', 'id'] },
      );
      if (!userExist) {
        return commonMessages.commonLoginFail;
      }

      if (userExist) {
        const passwordCorrect = await userExist.checkPassword(pwd);
        if (!passwordCorrect) {
          return commonMessages.commonLoginFail;
        }

        if (passwordCorrect) {
          const activeToken = this.authService.sign(
            'nickName',
            userExist.nickName,
            60 * 60,
          );
          const refreshToken = this.authService.sign(
            'id',
            userExist.id,
            60 * 60 * 24 * 7,
          );

          await this.user.save({
            id: userExist.id,
            refreshToken: String(refreshToken),
          });

          return {
            ok: true,
            activeToken,
            refreshToken,
          };
        }
      }
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('로그인이');
    }
  }

  async authEmail(loginUser: User, { code }: AuthDTO): Promise<AuthOutput> {
    try {
      const exist = await this.auth.findOne(
        { user: loginUser, code },
        { select: ['id'] },
      );

      if (!exist) {
        return commonMessages.commonAuthFail;
      }

      if (exist) {
        await this.auth.delete(exist.id);
        await this.user.save({ id: loginUser.id, verified: true });
      }
      return commonMessages.commonSuccess;
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('이메일 인증이');
    }
  }

  async findPassword({ email }: FindPasswordDTO): Promise<FindPasswordOutput> {
    try {
      const exist = await this.findByCondition({ ['email']: email });
      if (!exist) {
        return commonMessages.commonNotFuond('이메일을');
      }
      const newPassword = uuid.v4();
      await this.authService.sendMail(exist.email, newPassword);

      exist.pwd = newPassword;
      await this.user.save(exist);
      return {
        ok: true,
        message:
          '이메일로 변경된 비밀번호가 발송되었습니다. 이메일을 확인하세요.',
      };
    } catch (e) {
      console.log(e);
      return commonMessages.commonAuthFail;
    }
  }

  async updateUser(user: User, data: UpdateUserDTO) {
    const isEmailDifferent = 'email' in data && data.email !== user.email;
    try {
      if (isEmailDifferent) {
        const newVerify = await this.authService.makeVerifyCode(User);
        await this.authService.sendMail(data.email, newVerify.code);
      }

      let activeToken;
      if ('nickName' in data && data.nickName !== user.nickName) {
        activeToken = this.authService.sign('nickName', data.nickName, 60 * 60);
      }

      for (let i in data) {
        if (i === 'passwordConfirm') continue;

        user[i] = data[i];
      }

      await this.user.save(user);

      return {
        ok: true,
        ...(isEmailDifferent && {
          message: '변경된 이메일로 인증번호가 발송되었습니다.',
        }),
        ...(activeToken && { activeToken }),
      };
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('사용자 정보 업데이트가');
    }
  }

  async refrechToken(user: User, data: RefreshTokenDTO) {
    try {
      const activeToken = this.authService.sign('nickName', user.nickName, 1);
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
      for (let item of Object.keys(data)) {
        let exist;

        if (!user) {
          exist = await this.findByCondition({
            [item]: data[item],
          });
        } else {
          exist = await this.exceptMeFound(user.id, {
            [item]: data[item],
          });
        }

        if (exist) {
          return commonMessages.commonExist(item);
        }
      }
      return commonMessages.commonSuccess;
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('중복확인이');
    }
  }

  async registerUser(data: JoinDTO): Promise<User> {
    const newUser = this.user.create(data);
    return this.user.save(newUser);
  }

  async findByCondition(condition: object): Promise<User> {
    return this.user.findOne(condition);
  }

  async exceptMeFound(id: number, cretical?: object): Promise<User> {
    return this.user.findOne({ where: { id: Not(id), ...cretical } });
  }

  async deleteToken(id) {
    return this.user.save({ id, refreshToken: null });
  }
}
