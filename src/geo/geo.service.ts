import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  ) {}

  // 지역코드, 카테고리 기반으로 DB에서 코스들을 가져온다
  // 제로일 시 예외처리 필요
  async getWithInKm(lat1, lng1, km, areaCode, contenttypeid, category) {
    const allData = await this.courses
      .createQueryBuilder()
      .where('areacode IN (:...areaCode)', { areaCode })
      .andWhere('cat2 IN (:...category)', { category })
      .getMany();

    if (allData.length === 0) {
      return { ok: false, error: '조건에 맞는 데이터가 없습니다.' };
    }

    const result = [];

    // 거리 안에 있는 것만 남긴다
    // 제로일 시 예외처리 필요
    for (const i of allData) {
      if (!i.mapx || !i.mapy) {
        continue;
      }
      if (i.taketime && i.taketime.includes('박')) {
        // n박m일이면 다 쳐낸다
        continue;
      }
      const distance = this.getDistanceFromLatLonInKm(
        lat1,
        lng1,
        Number(i.mapy),
        Number(i.mapx),
      );
      if (distance <= km) {
        result.push({ ...i, distance: Math.round(distance) });
      }
    }
    if (result.length === 0) {
      return { ok: false, error: '조건에 맞는 데이터가 없습니다.' };
    }

    const poppedCourse = result.splice(
      Math.floor(Math.random() * result.length),
      1,
    )[0];

    poppedCourse['courseImages'] = [
      poppedCourse.firstimage,
      poppedCourse.firstimage2,
    ];

    delete poppedCourse.firstimage;
    delete poppedCourse.firstimage2;

    poppedCourse['course'] = [];

    const courseRouteArr = await this.courseRoutes.find({
      contentid: poppedCourse.contentid,
    });

    for (const i of courseRouteArr) {
      const locationInRoute = await this.locations.find({
        contentid: +i.subcontentid,
      });
      poppedCourse.course.push(locationInRoute);
    }

    return { ok: true, data: poppedCourse };
  }

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
