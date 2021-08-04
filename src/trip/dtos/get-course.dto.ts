import {
  IsArray,
  IsDate,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Course } from '../entities/course.entity';

export class GetCourseInput {
  @IsOptional() // 테스트용 나중에 지울것
  @IsDateString()
  startDate: Date;

  @IsOptional() // 테스트용 나중에 지울것
  @IsArray()
  category: string[];

  @IsArray()
  areaCode: number;

  @IsString()
  lat: string;

  @IsString()
  lng: string;

  @IsNumber()
  contenttypeid: number;
}

export class GetCourseOutput extends CommonOutput {
  data?: Course[];
}
