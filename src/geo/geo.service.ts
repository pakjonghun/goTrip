import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/trip/entities/course.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(Course) private readonly courses: Repository<Course>,
  ) {}

  async getWithInKm(lat1, lng1, km, areaCode, contenttypeid, category) {
    const allData = await this.courses
      .createQueryBuilder()
      .where('areacode IN (:...areaCode)', { areaCode })
      .andWhere('contenttypeid = :contenttypeid', { contenttypeid })
      .andWhere('cat2 IN (:...category)', { category })
      .getMany();

    const result = [];

    for (const i of allData) {
      if (!i.mapx || !i.mapy) {
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

    // 선택지가 4개를 초과할 시, 4개까지 줄여서 보내주기
    // 4개 이하일 시, 그냥 보내주기
    // Array.splice(랜덤시작인덱스, 1개만 제거)[0] 제거한 요소들의 배열을 반환하니 0번째 요소가 뽑은 숫자
    if (result.length > 4) {
      const resultWhenOverFour = [];
      while (resultWhenOverFour.length < 4) {
        const poppedCourse = result.splice(
          Math.floor(Math.random() * result.length),
          1,
        )[0];
        resultWhenOverFour.push(poppedCourse);
      }

      return resultWhenOverFour;
    }

    return result;
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
