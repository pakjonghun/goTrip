import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import axios from 'axios';
import { URLSearchParams } from 'url';
import { AuthService } from './auth.service';
import { PhoneAuthDTO, PhoneAuthOutput } from './dtos/phoneAuth.dto';
import { PhoneConfirmDTO, PhoneConfirmOutput } from './dtos/phoneConfirm.dto';
import {
  FindPasswordDTO,
  FindPasswordOutput,
} from 'src/auth/dtos/findPassword.dto';
import { TempTokenDTO } from './dtos/tempToken.dto';
import { Request, Response } from 'express';
import * as qs from 'qs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('phone')
  phoneAuth(@Body() data: PhoneAuthDTO): Promise<PhoneAuthOutput> {
    return this.authService.phone(data);
  }

  @Delete('phoneconfirm')
  phoneConfirm(
    @Req() req: Request,
    @Body() data: PhoneConfirmDTO,
  ): Promise<PhoneConfirmOutput> {
    return this.authService.phoneConfirm(data);
  }

  @Post('findpassword')
  findPassword(@Body() data: FindPasswordDTO): Promise<FindPasswordOutput> {
    return this.authService.forPasswordPhone(data);
  }

  @Post('temptoken')
  tempToken(@Body() data: TempTokenDTO, @Req() req: Request) {
    return this.authService.tempToken(data);
  }

  @Get('kakao')
  kakaotoc(@Res() res: Response) {
    const config = {
      client_id: 'c7cc12486e000f61e2024be8dbc30e3c',
      redirect_uri: 'http://localhost:5000/auth/test',
      response_type: 'code',
    };

    const rest = new URLSearchParams(config).toString();
    const url = `https://kauth.kakao.com/oauth/authorize?${rest}`;
    return res.redirect(url);
  }

  @Get('test')
  async getData(@Query() data) {
    const code = await axios({
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      url: 'https://kauth.kakao.com/oauth/token',
      data: qs.stringify({
        grant_type: 'authorization_code',
        client_id: 'c7cc12486e000f61e2024be8dbc30e3c',
        redirect_uri: 'http://localhost:5000/auth/test',
        code: data.code,
      }),
    });
    console.log(code.data);
  }
}
