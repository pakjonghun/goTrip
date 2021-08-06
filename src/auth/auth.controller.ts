import { Body, Controller, Delete, Get, Post, Req, Res } from '@nestjs/common';
import axios from 'axios';
import { URLSearchParams } from 'url';
import { AuthService } from './auth.service';
import { PhoneAuthDTO, PhoneAuthOutput } from './dtos/phoneAuth.dto';
import { PhoneConfirmDTO, PhoneConfirmOutput } from './dtos/phoneConfirm.dto';
import { getUser } from './getUser.decorator';
import { User } from 'src/user/entities/user.entity';
import {
  FindPasswordDTO,
  FindPasswordOutput,
} from 'src/user/dtos/findPassword.dto';
import { TempTokenDTO } from './dtos/tempToken.dto';
import { Request, Response } from 'express';
import qs from 'qs';

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
    @getUser() user: User,
    @Body() data: PhoneConfirmDTO,
  ): Promise<PhoneConfirmOutput> {
    return this.authService.phoneConfirm(req, user, data);
  }

  @Post('findpassword')
  findPassword(@Body() data: FindPasswordDTO): Promise<FindPasswordOutput> {
    return this.authService.phone(data);
  }

  @Post('temptoken')
  tempToken(@Body() data: TempTokenDTO) {}

  @Get('kakao')
  kakaotoc(@Res() res: Response) {
    const config = {
      client_id: 'c7cc12486e000f61e2024be8dbc30e3c',
      redirect_uri: 'http://localhost:5000/auth/test',
      response_type: 'code',
    };

    qs.stringify(config);
    const rest = new URLSearchParams(config).toString();
    const url = `https://kauth.kakao.com/oauth/authorize?${rest}`;
    console.log(url);
    return res.redirect(url);
  }
}
