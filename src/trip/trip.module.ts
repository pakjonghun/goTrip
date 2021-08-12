import { Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { GeoModule } from 'src/geo/geo.module';
import { CourseRoute } from './entities/courseRoute.entity';
import { Course } from './entities/course.entity';
import { TripDetail } from './entities/tripDetail.entity';
import { Image } from './entities/image.entity';
import { ApiModule } from 'src/api/api.module';
import { DetailAreaCode } from './entities/detailAreaCode.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DetailAreaCode,
      Location,
      CourseRoute,
      Course,
      TripDetail,
      Image,
    ]),
    GeoModule,
    ApiModule,
  ],
  providers: [TripService],
  controllers: [TripController],
})
export class TripModule {}
