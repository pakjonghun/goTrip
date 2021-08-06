import { PickType } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from '../entities/user.entity';

export class ConfirmExistDTO extends PickType(User, [
  'email',
  'phoneNumber',
  'socialId',
]) {
  @IsString({ message: '올바른 닉네임 형식이 아닙니다.' })
  @Matches(/^[a-z0-9!-=\S]*$/i, {
    message: '닉네임은 형식에 맞는 값을 사용하세요.',
  })
  @Length(3, 15, { message: '닉네임을 3글자 이상 15글자 이하로 입력하세요' })
  @IsOptional()
  nickName: string;
}

export class ConfirmExistOutput extends CommonOutput {}
