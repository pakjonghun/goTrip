import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreaCode } from 'src/trip/entities/areacode.entity';
import { Course } from 'src/trip/entities/course.entity';
import { CourseRoute } from 'src/trip/entities/courseRoute.entity';
import { Location } from 'src/trip/entities/location.entity';
import { GeoService } from './geo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Location, CourseRoute, AreaCode]),
  ],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}
