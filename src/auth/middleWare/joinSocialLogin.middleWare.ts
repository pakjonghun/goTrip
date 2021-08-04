import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { commonMessages } from 'src/common/erroeMessages';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class SocialLoginMiddleWare implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const data = req.body;
    try {
      if ('socialId' in data) {
        const after = [];
        const before = [];

        let exist = await this.userService.findByCondition({
          socialId: data.socialId,
        });

        if (exist) {
          for (let i in data) {
            if (data[i] !== exist[i]) {
              after.push({ [i]: data[i] });
              before.push({ [i]: exist[i] || '입력안됨' });
            }
          }
        }

        if (!exist) {
          exist = await this.userService.registerUser(data);
        }

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

        return res.json({
          ok: true,
          ...(after.length > 0 && {
            before,
            after,
            message: '회원정보가 변경됩니다. 변경하겠습니까?',
          }),

          activeToken,
          refreshToken,
        });
      }
      return next();
    } catch (e) {
      console.log(e);
      return res.json(commonMessages.commonFail('인증이'));
    }
  }
}
