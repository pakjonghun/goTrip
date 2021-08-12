import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { AreaCode } from 'src/trip/entities/areacode.entity';
import { Course } from 'src/trip/entities/course.entity';
import { CourseRoute } from 'src/trip/entities/courseRoute.entity';
import { Location } from 'src/trip/entities/location.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(Course) private readonly courses: Repository<Course>,
    @InjectRepository(Location)
    private readonly locations: Repository<Location>,
    @InjectRepository(CourseRoute)
    private readonly courseRoutes: Repository<CourseRoute>,
    @InjectRepository(AreaCode)
    private readonly areaCodes: Repository<AreaCode>,
  ) {}

  getDistanceFromLatLonInKm(lat1, lng1, lat2, lng2) {
    function deg2rad(deg) {
      return deg * (Math.PI / 180);
    }

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1); // deg2rad below
    const dLon = deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }
}
