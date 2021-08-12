import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetCateDTO {
  @IsNumber()
  contentType: number;

  @IsNumber()
  areaCode: number;

  @IsNumber()
  @IsOptional()
  page?: number;
}
