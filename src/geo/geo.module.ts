import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/trip/entities/course.entity';
import { CourseRoute } from 'src/trip/entities/courseRoute.entity';
import { Location } from 'src/trip/entities/location.entity';
import { GeoService } from './geo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Location, CourseRoute])],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}
