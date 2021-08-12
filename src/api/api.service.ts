import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AreaCode } from 'src/trip/entities/areacode.entity';
import { DetailAreaCode } from 'src/trip/entities/detailAreaCode.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Location } from 'src/trip/entities/location.entity';
import { Course } from 'src/trip/entities/course.entity';
import { CourseRoute } from 'src/trip/entities/courseRoute.entity';
import { TripDetail } from 'src/trip/entities/tripDetail.entity';
import { Image } from 'src/trip/entities/image.entity';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(AreaCode) private readonly area: Repository<AreaCode>,
    @InjectRepository(DetailAreaCode)
    private readonly detailArea: Repository<DetailAreaCode>,
    @InjectRepository(Location) private readonly location: Repository<Location>,
    @InjectRepository(Course) private readonly course: Repository<Course>,
    @InjectRepository(CourseRoute)
    private readonly courseRouter: Repository<CourseRoute>,
    @InjectRepository(TripDetail)
    private readonly tripDetail: Repository<TripDetail>,
    @InjectRepository(Image) private readonly image: Repository<Image>,
  ) {}

  async getDatas(url, params) {
    try {
      const data = await axios.get(
        `http://api.visitkorea.or.kr/openapi/service/rest/KorService/${url}`,
        {
          params: {
            ...params,
            MobileOS: 'ETC',
            MobileApp: 'init',
            ServiceKey: decodeURIComponent(
              'R1YkIepzkxhj6Ouue%2Fo0BcyXRM89NzjOU2baG8hXDjqv7MyVSxspxUBLzUZOJPISnGgxDg8SaIutpCmhB7OE%2Fg%3D%3D',
            ),
          },
        },
      );

      const {
        data: {
          response: {
            body: {
              items: { item },
            },
          },
        },
      } = data;

      return item;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
