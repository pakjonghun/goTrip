import { PickType } from '@nestjs/swagger';
import { IsBoolean, IsString, isString } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { JoinDTO } from './join.dto';

export class SocialUpdateDTO extends PickType(JoinDTO, []) {
  @IsBoolean()
  change: boolean;
}

export class SocialUpdateOutput extends CommonOutput {}
