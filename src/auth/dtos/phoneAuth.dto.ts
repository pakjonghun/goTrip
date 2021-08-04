import { PickType } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { PhoneAuthEntity } from '../entities/phoneAuth.entity';

export class PhoneAuthDTO extends PickType(PhoneAuthEntity, ['phoneNumber']) {}

export class PhoneAuthOutput extends CommonOutput {}
