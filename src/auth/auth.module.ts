import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { AuthController } from './auth.controller';
import { PhoneAuthEntity } from './entities/phoneAuth.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Auth, PhoneAuthEntity]),
    forwardRef(() => UserModule),
  ],
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
