import { PickType } from '@nestjs/swagger';
import { PhoneAuthEntity } from '../entities/phoneAuth.entity';

export class PhoneConfirmDTO extends PickType(PhoneAuthEntity, [
  'code',
  'phoneNumber',
]) {}
