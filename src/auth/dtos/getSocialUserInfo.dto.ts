import { IsString } from 'class-validator';

export class GetSocialUserInfoDTO {
  @IsString({ message: '올바른 형식의 토큰을 보내주세요' })
  token: string;
}
