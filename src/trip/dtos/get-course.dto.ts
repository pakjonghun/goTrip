import {
  IsArray,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Course } from '../entities/course.entity';
import { AREA_CODES } from '../trip.constants';

export class GetCourseInput {
  @IsOptional()
  @IsDateString()
  startDate: Date;

  @IsNumber()
  wishWeek: number;

  @IsArray()
  // @IsIn(CATEGORIES, { each: true })
  courseOptions: string[];

  @IsArray()
  // @IsIn(CATEGORIES, { each: true })
  locationOptions: string[];

  @IsNumber()
  @IsIn(AREA_CODES)
  startAreaCode: number;

  @IsOptional()
  @IsNumber()
  @IsIn(AREA_CODES)
  wideAreaCode: number;

  @IsOptional()
  @IsNumber()
  // @IsIn(AREA_CODES, { each: true })
  smallAreaCode: number;

  @IsString()
  lat: string;

  @IsString()
  lng: string;

  @IsNumber()
  @IsIn([0, 1])
  style: number;
}

export class GetCourseOutput extends CommonOutput {
  data?: Course[];
}
