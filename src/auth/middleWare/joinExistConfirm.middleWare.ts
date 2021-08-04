import { Injectable, NestMiddleware } from '@nestjs/common';
import { json, NextFunction, Request, Response } from 'express';
import { commonMessages } from 'src/common/erroeMessages';
import { JoinDTO } from 'src/user/dtos/join.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class JoinExistConfirmMiddleWare implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const data: JoinDTO = req.body;

    try {
      for (let item in data) {
        if (
          item === 'pwd' ||
          item === 'pwdConfirm' ||
          item === 'socialId' ||
          item === 'change'
        )
          continue;
        const exist = await this.userService.findByCondition({
          [item]: data[item],
        });
        if (exist) return res.json(commonMessages.commonExist(item));
      }

      if ('change' in data) {
        delete data['change'];
        await this.userService.registerUser(data);
        return res.json({ ok: true });
      }
      return next();
    } catch (e) {
      console.log(e);
      return res.json(commonMessages.commonFail('인증이'));
    }
  }
}
