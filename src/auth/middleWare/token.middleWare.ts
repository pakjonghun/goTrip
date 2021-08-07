import { Injectable, NestMiddleware } from '@nestjs/common';
import { json, NextFunction, Request, Response } from 'express';
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
    const auth = req.headers.authorization;
    if (!auth || auth === 'undefined') {
      return res.json(commonMessages.commonAuthFail);
    }
    const tokenArray = auth.split(' ');
    if (tokenArray[0] !== 'Bearer') {
      return res.json(commonMessages.commonAuthFail);
    }

    const tokenPayload = this.authService.verify(tokenArray[1]);
    if (typeof tokenPayload === 'string') {
      if (tokenPayload === 'TokenExpiredError') {
        return res.json({ ok: false, error: 'expireToken' });
      }

      return res.json(commonMessages.commonAuthFail);
    }

    if (typeof tokenPayload === 'object' && 'id' in tokenPayload) {
      const user = await this.userService.findByCondition({
        id: tokenPayload.id,
      });
      req['user'] = user;

      return next();
    }

    return res.json({ ok: false, error: '잘못된 접근 입니니다.' });
  }
}
