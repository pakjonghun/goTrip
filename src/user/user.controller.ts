import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { getUser } from 'src/auth/getUser.decorator';
import { Guard } from 'src/auth/useGuard';
import { commonMessages } from 'src/common/erroeMessages';
import { AuthDTO, AuthOutput } from './dtos/auth.dto';
import { ConfirmExistDTO, ConfirmExistOutput } from './dtos/confirmExist.dto';
import { FindPasswordDTO, FindPasswordOutput } from './dtos/findPassword.dto';
import { JoinDTO, JoinOutput } from './dtos/join.dto';
import { LoginDTO } from './dtos/login.dto';
import { MeOutput } from './dtos/me.dto';
import { RefreshTokenDTO } from './dtos/refreshToken.dto';
import { UpdateUserDTO } from './dtos/updateUser.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('join')
  join(@Body() data: JoinDTO): Promise<JoinOutput> {
    return this.userService.join(data);
  }

  @Post('login')
  login(@Body() data: LoginDTO) {
    return this.userService.login(data);
  }

  @UseGuards(Guard)
  @Get('me')
  me(@getUser() user: User): MeOutput {
    return { ok: true, data: user };
  }

  @UseGuards(Guard)
  @Post('auth')
  auth(@getUser() user: User, @Body() data: AuthDTO): Promise<AuthOutput> {
    return this.userService.authEmail(user, data);
  }

  @Put('findpassword')
  findPassword(@Body() data: FindPasswordDTO): Promise<FindPasswordOutput> {
    return this.userService.findPassword(data);
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

  @Post('confirmexist')
  async confirmExist(
    @getUser() user: User,
    @Body() data: ConfirmExistDTO,
  ): Promise<ConfirmExistOutput> {
    return this.userService.confirmExist(user, data);
  }
}
