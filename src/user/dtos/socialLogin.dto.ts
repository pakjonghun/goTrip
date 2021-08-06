import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';

export class SocialDTO {
  @IsString({ message: '형식에 맞지 않는 토큰입니다.' })
  socialToken: string;

  @IsOptional()
  @IsBoolean({ message: '형식에 맞지 않는 업데데이트 요청 입니다.' })
  change?: boolean;
}

export class SocialOutput extends CommonOutput {
  accessToken?: string;
  refreshToken?: string;
}
