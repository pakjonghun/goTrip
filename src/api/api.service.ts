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
  ) {
    // this.getCommonDetail();
    this.getCommonDetail();
  }

  async getCommonDetail() {
    const tempDB = await this.location.find({
      select: ['contentid', 'contenttypeid'],
      where: [{ areacode: 2 }],
      order: { createdAt: 'ASC' },
    });
    for (let i of tempDB) {
      const exist = await this.tripDetail.findOne({
        contentid: String(i.contentid),
      });
      if (!exist) continue;
      const data = await this.getData(
        'detailIntro',
        i.contentid,
        i.contenttypeid,
      );

      for (let i in data) {
        exist[i] = data[i];
      }

      await this.tripDetail.save(exist);
    }
    console.log('finish');
  }

  async getData(url: string, contentid?: any, contenttypeid?: any) {
    try {
      const api = axios.create({
        baseURL: 'http://api.visitkorea.or.kr/openapi/service/rest/KorService/',
        params: {
          MobileOS: 'ETC',
          MobileApp: 'init',
          ServiceKey: decodeURIComponent(
            'R1YkIepzkxhj6Ouue%2Fo0BcyXRM89NzjOU2baG8hXDjqv7MyVSxspxUBLzUZOJPISnGgxDg8SaIutpCmhB7OE%2Fg%3D%3D',
          ),
        },
      });

      const data = await api.get(url, {
        params: {
          contentTypeId: contenttypeid,
          contentId: contentid,
          introYN: 'Y',
          overviewYN: 'Y',
          mapinfoYN: 'Y',
          addrinfoYN: 'Y',
          catcodeYN: 'Y',
          areacodeYN: 'Y',
          firstImageYN: 'Y',
          defaultYN: 'Y',
        },
      });

      const {
        data: {
          response: { body },
        },
      } = data;
      return body.items.item;
    } catch (e) {
      console.log(e);
    }
  }
}
