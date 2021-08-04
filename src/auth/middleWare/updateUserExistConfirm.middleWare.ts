import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { commonMessages } from 'src/common/erroeMessages';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class UpdateUserExistConfirmMiddleWare implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const data = req.body;
    const user = req['user'];
    if (!user) {
      return res.json(commonMessages.commonAuthFail);
    }

    try {
      for (let item in data) {
        if (item === 'pwd' || item === 'pwdConfirm') continue;
        const result = await this.userService.exceptMeFound(user.id, {
          [item]: data[item],
        });
        console.log(result);
        if (result) {
          return res.json(commonMessages.commonExist(item));
        }
      }
    } catch (e) {
      console.log(e);
      return res.json(commonMessages.commonFail('회원정보 변경이'));
    }
    return next();
  }
}
