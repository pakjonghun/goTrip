import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { getUser } from 'src/auth/getUser.decorator';
import { Guard } from 'src/auth/useGuard';
import {
  ChangePasswordDTO,
  ChangePasswordOutput,
} from './dtos/changePassword.dto';
import { ConfirmExistDTO, ConfirmExistOutput } from './dtos/confirmExist.dto';
import { JoinDTO, JoinOutput } from './dtos/join.dto';
import { LoginDTO, LoginOutput } from './dtos/login.dto';
import { MeOutput } from './dtos/me.dto';
import { RefreshTokenDTO } from './dtos/refreshToken.dto';
import { SocialDTO, SocialOutput } from './dtos/socialLogin.dto';
import { UpdateUserDTO } from './dtos/updateUser.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('join')
  async join(@Body() data: JoinDTO): Promise<JoinOutput> {
    return this.userService.join(data);
  }

  @Post('kakao')
  async kakaoLogin(
    @Res() res: Response,
    @Req() req: Request,
    @Body() data: SocialDTO,
  ): Promise<SocialOutput> {
    return this.userService.socialLoginService(req, res, data);
  }

  @Post('naver')
  async naverLogin(
    @Res() res: Response,
    @Req() req: Request,
    @Body() data: SocialDTO,
  ): Promise<SocialOutput> {
    return this.userService.socialLoginService(req, res, data);
  }

  @Post('confirmexist')
  async confirmExist(
    @getUser() user: User,
    @Body() data: ConfirmExistDTO,
  ): Promise<ConfirmExistOutput> {
    return this.userService.confirmExist(user, data);
  }

  @Post('login')
  login(@Body() data: LoginDTO): Promise<LoginOutput> {
    return this.userService.login(data);
  }

  @UseGuards(Guard)
  @Put('changepassword')
  changePassword(
    @getUser() user: User,
    @Body() data: ChangePasswordDTO,
  ): Promise<ChangePasswordOutput> {
    return this.userService.changePassword(user, data);
  }

  @UseGuards(Guard)
  @Put('update')
  updateUser(@getUser() user: User, @Body() data: UpdateUserDTO) {
    return this.userService.updateUser(user, data);
  }

  @UseGuards(Guard)
  @Post('refreshtoken')
  refreshToken(@getUser() user: User, @Body() refreshToken: RefreshTokenDTO) {
    return this.userService.refrechToken(user, refreshToken);
  }

  @UseGuards(Guard)
  @Get('me')
  me(@getUser() user: User): MeOutput {
    delete user['id'];
    delete user['socialId'];
    delete user['refreshToken'];
    delete user['updatedAt'];
    delete user['createdAt'];
    return { ok: true, data: user };
  }
}
