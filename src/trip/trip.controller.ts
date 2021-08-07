import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GetCourseProcessOutput } from './dtos/get-course-process.dto';
import { GetCourseInput, GetCourseOutput } from './dtos/get-course.dto';
import { DUMMY_DATA } from './trip.constants';
import { TripService } from './trip.service';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get('search')
  mytest() {
    return DUMMY_DATA;
  }

  @Post('search')
  getCourse(@Body() getCourseInput: GetCourseInput): Promise<GetCourseOutput> {
    return this.tripService.getCourse(getCourseInput);
  }

  @Get(':contentid')
  getCourseProcess(
    @Param('contentid') contentid: number,
  ): Promise<GetCourseProcessOutput> {
    return this.tripService.getCourseProcess(contentid);
  }
}
