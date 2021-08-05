import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreaCode } from 'src/trip/entities/areacode.entity';
import { Course } from 'src/trip/entities/course.entity';
import { CourseRoute } from 'src/trip/entities/courseRoute.entity';
import { DetailAreaCode } from 'src/trip/entities/detailAreaCode.entity';
import { Image } from 'src/trip/entities/image.entity';
import { Location } from 'src/trip/entities/location.entity';
import { TripDetail } from 'src/trip/entities/tripDetail.entity';
import { ApiService } from './api.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AreaCode,
      DetailAreaCode,
      Location,
      Course,
      CourseRoute,
      Image,
      TripDetail,
    ]),
  ],
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {}
