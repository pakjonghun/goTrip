import { OmitType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from '../entities/user.entity';

export class JoinDTO extends OmitType(User, [
  'createdAt',
  'id',
  'updatedAt',
  'varified',
  'refreshToken',
]) {
  @IsBoolean({ message: 'change를 올바른 형식으로 입력하세요.' })
  @IsOptional()
  change?: string;
}

export class JoinOutput extends CommonOutput {
  message?: string;
}
