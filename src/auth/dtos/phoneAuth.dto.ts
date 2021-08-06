import { PickType } from '@nestjs/swagger';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { FindPasswordDTO } from 'src/user/dtos/findPassword.dto';

export class PhoneAuthDTO extends PickType(FindPasswordDTO, [
  'email',
  'phoneNumber',
]) {}

export class PhoneAuthOutput extends CommonOutput {
  message?: string;
}
