import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GetTripDetailOutput } from './dtos/get-trip-detail.dto';
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
  getTripDetail(@Param('contentid') contentid: number) {
    return this.tripService.getTripDetail(contentid);
  }
  //: Promise<GetTripDetailOutput>
}
