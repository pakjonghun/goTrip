import { IsOptional } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from '../entities/user.entity';

export class MeOutput extends CommonOutput {
  @IsOptional()
  data?: User;
}
