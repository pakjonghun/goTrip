import { IsString } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';

export class RefreshTokenDTO {
  @IsString({ message: '형식에 맞는 값을 입력하세요' })
  key: string;
}

export class RefreshTokenOutput extends CommonOutput {
  activeToken?: string;
}
