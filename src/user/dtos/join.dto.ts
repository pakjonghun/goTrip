import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from '../entities/user.entity';

export class JoinDTO extends PickType(User, ['phoneNumber']) {
  @IsString({ message: '올바른 닉네임 형식이 아닙니다.' })
  @Matches(/^[[ㄱ-ㅎㅏ-ㅣ가-힣a-z0-9!-=\S]*$/i, {
    message: '닉네임은 형식에 맞는 값을 사용하세요.',
  })
  @Length(2, 15, { message: '닉네임을 2글자 이상 15글자 이하로 입력하세요' })
  nickName: string;

  @IsEmail({}, { message: '이메일 형식을 입력하세요.' })
  email: string;

  @Length(8, 40, { message: '비밀번호는 8~40로 입력하세요' })
  @Matches(/^[\S]*$/i, { message: '비밀번호에 공란은 허용되지 않습니다.' })
  @IsString({ message: '올바른 비밀번호 형식이 아닙니다.' })
  pwd: string;

  @Length(8, 40, { message: '비밀번호는 8~40로 입력하세요' })
  @IsString({ message: '올바른 비밀번호 형식이 아닙니다.' })
  @Matches(/^[\S]*$/i, { message: '비밀번호에 공란은 허용되지 않습니다.' })
  pwdConfirm: string;
}

export class JoinOutput extends CommonOutput {}
