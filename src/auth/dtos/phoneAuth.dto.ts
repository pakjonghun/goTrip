import { IsString, Matches } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';

export class PhoneAuthDTO {
  @IsString({ message: '올바른 휴대폰번호 형식이 아닙니다.' })
  @Matches(/^[0-9]{11}$/i, {
    message: '휴대폰번호를 형식에 맞게 입력하세요.',
  })
  phoneNumber: string;
}

export class PhoneAuthOutput extends CommonOutput {}
