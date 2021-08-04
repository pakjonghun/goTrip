import { Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { AreaCode } from './entities/areacode.entity';
import { Location } from './entities/location.entity';
import { GeoModule } from 'src/geo/geo.module';
import { DetailAreaCode } from './entities/detailAreaCode.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, AreaCode, Location, DetailAreaCode]),
    GeoModule,
  ],
  providers: [TripService],
  controllers: [TripController],
})
export class TripModule {}
