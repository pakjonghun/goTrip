import { forwardRef } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PhoneAuthEntity } from 'src/auth/entities/phoneAuth.entity';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    TypeOrmModule.forFeature([User, PhoneAuthEntity]),
    forwardRef(() => AuthModule),
  ],
  exports: [UserService],
})
export class UserModule {}
