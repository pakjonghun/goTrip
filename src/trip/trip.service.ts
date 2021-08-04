import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeoService } from 'src/geo/geo.service';
import { Repository } from 'typeorm';
import { GetCourseProcessOutput } from './dtos/get-course-process.dto';
import { GetCourseInput, GetCourseOutput } from './dtos/get-course.dto';
import { Location } from './entities/location.entity';

@Injectable()
export class TripService {
  constructor(
    private readonly geoService: GeoService,
    @InjectRepository(Location)
    private readonly locations: Repository<Location>,
  ) {}

  async getCourse(getCourseInput: GetCourseInput): Promise<GetCourseOutput> {
    const { lat, lng, areaCode, contenttypeid, startDate, category } =
      getCourseInput;

    const result = await this.geoService.getWithInKm(
      lat,
      lng,
      200,
      areaCode,
      contenttypeid,
      category,
    );

    return result;
  }

  async getCourseProcess(contentid: number): Promise<GetCourseProcessOutput> {
    const courseProcess = await this.locations.find({ contentid });
    return { ok: true, courseProcess };
  }
}
