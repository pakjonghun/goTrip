import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PhoneAuthEntity } from './entities/phoneAuth.entity';
import { User } from 'src/user/entities/user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([PhoneAuthEntity, User]),
    forwardRef(() => UserModule),
  ],
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
