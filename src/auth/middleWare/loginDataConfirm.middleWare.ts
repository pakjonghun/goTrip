import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoginDataConfirmMiddleWare implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const data = req.body;
    if (!data.pwd || !data.email) {
      return res.json({
        ok: false,
        error: '이메일과 비밀번호를 모두 입력하세요.',
      });
    }
    return next();
  }
}
