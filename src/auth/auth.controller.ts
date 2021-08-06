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
import * as qs from 'qs';
import { getUser } from './getUser.decorator';
import { User } from 'src/user/entities/user.entity';
import {
  FindPasswordDTO,
  FindPasswordOutput,
} from 'src/user/dtos/findPassword.dto';
import { TempTokenDTO } from './dtos/tempToken.dto';
import { Request } from 'express';

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
}
