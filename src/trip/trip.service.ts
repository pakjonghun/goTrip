import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeoService } from 'src/geo/geo.service';
import { Repository } from 'typeorm';
import { GetCourseInput } from './dtos/get-course.dto';
import { Location } from './entities/location.entity';
import { TripDetail } from './entities/tripDetail.entity';
import { Course } from './entities/course.entity';
import { CourseRoute } from './entities/courseRoute.entity';
import { commonMessages } from 'src/common/erroeMessages';
import { ApiService } from 'src/api/api.service';
import { GetCateDTO } from './dtos/getCate.dto';
import { DetailAreaCode } from './entities/detailAreaCode.entity';

@Injectable()
export class TripService {
  constructor(
    private readonly geoService: GeoService,
    @InjectRepository(Location)
    private readonly locations: Repository<Location>,
    @InjectRepository(TripDetail)
    private readonly tripDetails: Repository<TripDetail>,
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
    @InjectRepository(CourseRoute)
    private readonly courseRoutes: Repository<CourseRoute>,
    private readonly apiService: ApiService,
    @InjectRepository(DetailAreaCode)
    private readonly detailArea: Repository<DetailAreaCode>,
  ) {}

  async getCourse(getCourseInput: GetCourseInput) {
    const { startDate, contentType, areaCode, lat, lng } = getCourseInput;
    const random = [];
    const rests = [];
    const contentTypes = [{ contenttypeid: 39 }];
    contentType.forEach((contenttypeid) => {
      contentTypes.push({ contenttypeid });
    });

    try {
      let bigCode;
      if (areaCode) {
        const bigArea = await this.detailArea.findOne({
          where: {
            code: String(areaCode),
          },
          relations: ['areacode'],
        });

        bigCode = bigArea.areacode.code;
      }

      const data = await this.locations.find({
        where: [...contentTypes, { areacode: bigCode }],
      });
      const withInKm = [];
      for (let item of data) {
        const km = this.geoService.getDistanceFromLatLonInKm(
          lat,
          lng,
          item.mapy,
          item.mapx,
        );
        if (km < 100) {
          withInKm.push(item);
        }
      }

      const rest = withInKm.filter((item) => item.contenttypeid === '39');
      const noRest = withInKm.filter((item) => item.contenttypeid !== '39');

      for (let i = 0; i < 4; i++) {
        const key = Math.floor(Math.random() * noRest.length);
        random.push(noRest[key]);
      }

      for (let i = 0; i < 2; i++) {
        const key = Math.floor(Math.random() * rest.length);
        rests.push(rest[key]);
      }

      for (let item of random) {
        const img = await this.apiService.getDatas('detailImage', {
          contentId: item.contentid,
          contentTypeId: item.contenttypeid,
        });

        const detail = await this.apiService.getDatas('detailCommon', {
          contentId: item.contentid,
          defaultYN: 'Y',
          overviewYN: 'Y',
          addrinfoYN: 'Y',
        });
        delete detail['createdtime'];
        delete detail['modifiedtime'];
        delete detail['booktour'];
        delete detail['zipcode'];
        delete detail['contentid'];
        delete detail['addr1'];
        delete detail['contenttypeid'];
        delete detail['addr2'];

        item['detail'] = detail;
        item.img = img;
      }

      console.log(random);
      return {
        ok: true,
        rest: rests,
        random: random,
      };
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('검색이');
    }
  }

  async getCate({ contentType, areaCode, page }: GetCateDTO) {
    try {
      const take = 6;
      const skip = take * (page - 1);

      const data = await this.locations.find({
        skip,
        take,
        where: { contenttypeid: contentType, areacode: areaCode },
      });

      for (let item of data) {
        const detail = await this.apiService.getDatas('detailCommon', {
          contentId: item.contentid,
          defaultYN: 'Y',
          overviewYN: 'Y',
          addrinfoYN: 'Y',
        });
        delete detail['createdtime'];
        delete detail['modifiedtime'];
        delete detail['booktour'];
        delete detail['zipcode'];

        item['detail'] = detail;
      }
      return {
        ok: true,
        data,
      };
    } catch (e) {
      console.log(e);
      return commonMessages.commonFail('관광지 검색이');
    }
  }
}
