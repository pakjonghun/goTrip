import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Res,
} from '@nestjs/common';
import axios from 'axios';
import { Request, Response } from 'express';
import { URLSearchParams } from 'url';
import { AuthService } from './auth.service';
import { PhoneAuthDTO, PhoneAuthOutput } from './dtos/phoneAuth.dto';
import { PhoneConfirmDTO } from './dtos/phoneConfirm.dto';
import * as qs from 'qs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('phone')
  phoneAuth(@Body() data: PhoneAuthDTO): Promise<PhoneAuthOutput> {
    return this.authService.phone(data);
  }

  @Delete('phoneconfirm')
  phoneConfirm(@Body() data: PhoneConfirmDTO) {
    return this.authService.phoneConfirm(data);
  }

  @Get('socialtoken')
  async goo(@Res() res) {
    const config = new URLSearchParams({
      client_id: 'c7cc12486e000f61e2024be8dbc30e3c',
      redirect_uri: 'http://localhost:5000/auth/test',
      response_type: 'code',
    });

    const basic = config.toString();
    // https://kauth.kakao.com/oauth/authorize?client_id=9e5a608854371cdca658dd189665cbed&redirect_uri=localhost%3A5000%2Fauth%2Ftest&response_type=code
    const url = `https://kauth.kakao.com/oauth/authorize?${basic}`;
    // console.log(url);

    return res.redirect(url);
  }

  @Get('test')
  async test(@Query() data2: any) {
    try {
      const data = await axios({
        method: 'post',
        url: 'https://kauth.kakao.com/oauth/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
          grant_type: 'authorization_code',
          client_id: 'c7cc12486e000f61e2024be8dbc30e3c',
          redirect_uri: 'http://localhost:5000/auth/test',
          code: data2.code,
        }),
      });
      // const data = await axios.post('https://kauth.kakao.com/oauth/token', {
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   data: qs.stringify({
      //     grant_type: 'authorization_code',
      //     client_id: 'c7cc12486e000f61e2024be8dbc30e3c',
      //     redirect_uri: 'http://localhost:5000/auth/test',
      //     code: data2.code,
      //   }),
      // });
      const token = data.data.access_token;
      console.log(token);

      // const d = await axios.post('https://kauth.kakao.com/oauth/token', {
      //   Headers: {
      //     'Content-type': 'application/x-www-form-urlencoded',
      //   },
      //   data: qs{
      //     grant_type: 'authorization_code',
      //     client_id: 'b66d1efe1bbc08915d6fba514db46ceb',
      //     redirect_uri: 'http://localhost:5000/auth/test',
      //     code: data2.code,
      //     client_secret: 'mO2PdOCuizX320VcIfc0E3s7cfv0Y0eb',
      //   },
      // });
      // console.log(d);
      this.authService.getSocialUserInfo(token);
    } catch (e) {
      console.log(e);
    }
  }
}
