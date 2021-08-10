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

    // 뽑은 코스에 해당하는 관광지들 아이디 추출
    const courseRouteArr = await this.courseRoutes.find({
      contentid: poppedCourse.contentid,
    });

    const locationOptionsInPoppedCourse = [];

    // 관광지들 아이디로 관광지 엔티티에서 정보가져와서 결과 오브젝트에 추가
    for (const i of courseRouteArr) {
      const contentid = +i.subcontentid;

      const locationInRoute = await this.locations.findOne({
        contentid: contentid,
      });

      if (!locationInRoute) {
        continue;
      }

      locationOptionsInPoppedCourse.push(locationInRoute.cat3);

      poppedCourse.course.push(locationInRoute);
    }

    const areaCodeOfPoppedCourse = poppedCourse.areacode;

    const whatElse = {};

    for (const locationOption of locationOptionsInPoppedCourse) {
      const locationCat2 = locationOption.substring(0, 5);
      if (locationCat2 in whatElse) {
        continue;
      }

      const locationsInThisAreaByOption = await this.locations.find({
        areacode: areaCodeOfPoppedCourse,
        // sigungucode: sigunguCodeOfPoppedCourse,
        cat3: locationOption,
      });

      // console.log(locationOption, locationsInThisAreaByOption.length);

      const limitedLocationsInThisAreaByOption = [];

      while (limitedLocationsInThisAreaByOption.length < 10) {
        const poppedLocation = locationsInThisAreaByOption.splice(
          Math.floor(Math.random() * locationsInThisAreaByOption.length),
          1,
        )[0];

        limitedLocationsInThisAreaByOption.push(poppedLocation);

        if (locationsInThisAreaByOption.length == 0) {
          break;
        }
      }

      whatElse[locationCat2] = limitedLocationsInThisAreaByOption;
    }

    return { ok: true, data: [poppedCourse, whatElse] };
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
