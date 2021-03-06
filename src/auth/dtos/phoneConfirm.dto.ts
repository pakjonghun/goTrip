import { PickType } from '@nestjs/swagger';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { PhoneAuthEntity } from '../entities/phoneAuth.entity';

export class PhoneConfirmDTO extends PickType(PhoneAuthEntity, [
  'code',
  'phoneNumber',
]) {}

export class PhoneConfirmOutput extends CommonOutput {}
