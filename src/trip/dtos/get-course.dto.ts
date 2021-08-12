import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class GetCourseInput {
  @IsString()
  @IsOptional()
  @Matches(/[0-9]{4}[-]?[0-9]{2}[-]?[0-9]{2}/i, {
    message: 'yyyy-mm-dd 형식으로 보내주세요.',
  })
  startDate?: string;

  @IsArray()
  @IsOptional()
  contentType?: number[];

  @IsNumber()
  areaCode?: number;

  @IsString()
  lat: string;

  @IsString()
  lng: string;
}
