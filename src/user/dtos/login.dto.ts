import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';

export class LoginDTO {
  @IsEmail({}, { message: '이메일 형식을 입력하세요.' })
  email: string;

  @Length(8, 40, { message: '비밀번호는 8~40로 입력하세요' })
  @Matches(/^[\S]*$/i, { message: '비밀번호에 공란은 허용되지 않습니다.' })
  @IsString({ message: '올바른 비밀번호 형식이 아닙니다.' })
  pwd: string;
}

export class LoginOutput extends CommonOutput {
  iat?: number;
  accessToken?: string;
  refreshToken?: string;
}
