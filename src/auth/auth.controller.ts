import { Body, Controller, Delete, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PhoneAuthDTO, PhoneAuthOutput } from './dtos/phoneAuth.dto';
import { PhoneConfirmDTO } from './dtos/phoneConfirm.dto';

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

  @Post('socialtoken')
  socialToken(@Body() data: string) {
    return this.authService.getSocialUserInfo(data);
  }
}
