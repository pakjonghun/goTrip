import { Matches } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';

export class PhoneAuthDTO {
  @Matches(/^[0-9]{11}$/i, {
    message: '휴대폰번호를 형식에 맞게 입력하세요. 예)010-0101-0101',
  })
  phoneNumber: string;
}

export class PhoneAuthOutput extends CommonOutput {}
