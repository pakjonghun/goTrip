import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreaCode } from 'src/trip/entities/areacode.entity';
import { DetailAreaCode } from 'src/trip/entities/detailAreaCode.entity';
import { Location } from 'src/trip/entities/location.entity';
import { ApiService } from './api.service';

@Module({
  imports: [TypeOrmModule.forFeature([AreaCode, DetailAreaCode, Location])],
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {}
