import { PickType } from '@nestjs/swagger';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { JoinDTO } from './join.dto';

export class ChangePasswordDTO extends PickType(JoinDTO, [
  'pwd',
  'pwdConfirm',
]) {}

export class ChangePasswordOutput extends CommonOutput {}
