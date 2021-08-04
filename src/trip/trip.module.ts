import { Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { GeoModule } from 'src/geo/geo.module';

@Module({
  imports: [TypeOrmModule.forFeature([Location]), GeoModule],
  providers: [TripService],
  controllers: [TripController],
})
export class TripModule {}
