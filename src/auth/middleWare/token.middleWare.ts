import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { commonMessages } from 'src/common/erroeMessages';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class TokenMiddleWare implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if ('authorization' in req.headers) {
      const tokenArray = req.headers.authorization.split(' ');
      if (tokenArray[0] !== 'Bearer') {
        return res.json(commonMessages.commonAuthFail);
      }

      if (req.body?.key === 'trip') {
        const exist = await this.userService.findByCondition({
          refreshToken: tokenArray[1],
        });
        if (!exist) {
          return res.json(commonMessages.commonAuthFail);
        }
        const tokenPayload = this.authService.verify(tokenArray[1]);
        if (typeof tokenPayload === 'string') {
          await this.userService.deleteToken(exist.id);
          return res.json(commonMessages.commonAuthFail);
        }

        if (typeof tokenPayload === 'object' && 'id' in tokenPayload) {
          const user = await this.userService.findByCondition({
            id: tokenPayload.id,
          });
          req['user'] = user;
          return next();
        }
      }

      const tokenPayload = this.authService.verify(tokenArray[1]);
      if (tokenPayload === 'TokenExpiredError') {
        return res.json({
          ok: false,
          error: '토큰기간만료',
          key: 'trip',
        });
      }

      if (typeof tokenPayload === 'string') {
        return res.json(commonMessages.commonAuthFail);
      }

      if (typeof tokenPayload === 'object' && 'nickName' in tokenPayload) {
        const user = await this.userService.findByCondition({
          nickName: tokenPayload['nickName'],
        });

        if (!user) {
          return res.json(commonMessages.commonAuthFail);
        }

        req['user'] = user;
      }
    }

    return next();
  }
}
