import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class JoinDataConfirmMiddleWare implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const data = req.body;
    if (!data.socialId && !data.email) {
      return res.json({
        ok: false,
        error: '소셜로그인 또는 회원가입을 하세요',
      });
    }

    if (!data.nickName) {
      return res.json({
        ok: false,
        error: '닉네임을 입력하세요.',
      });
    }

    if (data.email && !data.socialId) {
      if (!data.pwd || !data.pwdConfirm) {
        return res.json({
          ok: false,
          error: '비밀번호나 비밀번호 확인란을 입력하세요',
        });
      }

      if (data.pwd !== data.pwdConfirm) {
        return res.json({ ok: false, error: '비밀번호가 일치하지 않습니다.' });
      }
    }
    return next();
  }
}
