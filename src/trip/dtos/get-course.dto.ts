import {
  IsArray,
  IsDateString,
  IsIn,
  IsNumber,
  IsString,
} from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Course } from '../entities/course.entity';
import { AREA_CODES, CATEGORIES } from '../trip.constants';

export class GetCourseInput {
  @IsDateString()
  startDate: Date;

  @IsArray()
  @IsIn(CATEGORIES, { each: true })
  category: string[];

  @IsArray()
  @IsIn(AREA_CODES, {
    each: true,
  })
  areaCode: number[];

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
