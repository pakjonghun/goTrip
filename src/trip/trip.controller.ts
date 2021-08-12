import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetCourseInput } from './dtos/get-course.dto';
import { TripService } from './trip.service';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post('search')
  getCourse(@Body() getCourseInput: GetCourseInput) {
    return this.tripService.getCourse(getCourseInput);
  }

  @Get('cate')
  getTripDetail(@Query() data) {
    return this.tripService.getCate(data);
  }
}
