import { IsString } from 'class-validator';

export class TempTokenDTO {
  @IsString({ message: '형식에 맞지 않는 값입니다.' })
  code: string;
}
