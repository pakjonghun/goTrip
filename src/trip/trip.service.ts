import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { GeoService } from 'src/geo/geo.service';
import { Repository } from 'typeorm';
import { GetTripDetailOutput } from './dtos/get-trip-detail.dto';
import { GetCourseInput, GetCourseOutput } from './dtos/get-course.dto';
import { Location } from './entities/location.entity';
import { TripDetail } from './entities/tripDetail.entity';
import { Course } from './entities/course.entity';
import { CourseRoute } from './entities/courseRoute.entity';
import { NEAR_AREA } from './trip.constants';

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
  ) {}

  async getCourse(getCourseInput: GetCourseInput): Promise<GetCourseOutput> {
    const {
      startDate,
      wishWeek,
      courseOptions,
      locationOptions,
      startAreaCode,
      wideAreaCode,
      smallAreaCode,
      lat,
      lng,
      style,
    } = getCourseInput;

    let coursesFromDB = null;

    if (wideAreaCode) {
      // 목적지를 선택했을 시 : 지역코드와 코스옵션에 의거하여 DB에서 검색
      ////////////////////////////////////// 아직 시군구코드 적용안시킴!!!/////////////////////////////////////////////
      coursesFromDB = await this.courses
        .createQueryBuilder()
        .where('areacode = :wideAreaCode', { wideAreaCode })
        .andWhere('cat2 IN (:...courseOptions)', { courseOptions })
        .getMany();
    } else {
      // 목적지가 없을 시 : 고른 지역으로부터 200km이내에 있는 지역들의 코스를 검색
      coursesFromDB = await this.courses
        .createQueryBuilder()
        .where('areacode IN (:...wideAreaCode)', {
          wideAreaCode: NEAR_AREA[startAreaCode],
        })
        .andWhere('cat2 IN (:...courseOptions)', { courseOptions })
        .getMany();
      console.log('coursesFromDB.length:', coursesFromDB.length);
    }

    // 1박2일인거 다 쳐내
    let cnt = 0;
    for (const poppedCourse of coursesFromDB) {
      poppedCourse['course'] = [];

      // 뽑은 코스에 해당하는 관광지들 아이디 추출
      const courseRouteArr = await this.courseRoutes.find({
        contentid: poppedCourse.contentid,
      });

      if (style === 0) {
        if (courseRouteArr.length > 4) {
          poppedCourse['fitWithOption'] = false;
          continue;
        }
      } else if (style === 1) {
        if (courseRouteArr.length < 5) {
          poppedCourse['fitWithOption'] = false;
          continue;
        }
      }

      // poppedCourse['locationCount'] = courseRouteArr.length;

      // 관광지들 아이디로 관광지 엔티티에서 정보가져와서 결과 오브젝트에 추가
      for (const i of courseRouteArr) {
        const contentid = +i.subcontentid;

        const locationInRoute = await this.locations.findOne({ contentid });

        if (!locationInRoute) {
          continue;
        }

        poppedCourse.course.push(locationInRoute);
      }

      cnt += 1;
    }

    console.log('fittedCourse:', cnt); ///// 이 위까지가 매우 오래걸림

    coursesFromDB = coursesFromDB.filter((course) => {
      for (const location of course.course) {
        if (locationOptions.includes(location.cat2)) {
          return true;
        }
      }
    });

    // 옵션 맞는 코스들 중에 하나 랜덤으로 뽑는다
    const poppedCourse = coursesFromDB.splice(
      Math.floor(Math.random() * coursesFromDB.length),
      1,
    )[0];

    // 오버뷰 추가
    const courseOverview = await this.tripDetails.findOne({
      id: poppedCourse.id,
    });

    if (courseOverview) {
      poppedCourse['overview'] = courseOverview.overview;
    }

    const locationOptionsInPoppedCourse = [];

    for (const locationElement of poppedCourse.course) {
      locationOptionsInPoppedCourse.push(locationElement.cat2);
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

  //: Promise<GetTripDetailOutput>
  async getTripDetail(contentid: number) {
    const tripDetail = await this.locations.findOne({ contentid });
    const detailInfo = await this.tripDetails.findOne({
      contentid: tripDetail.contentid + '',
    });
    if (!detailInfo) {
      const serviceKey = decodeURIComponent(process.env.TOUR_API_KEY);

      await axios
        .get(
          'http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailIntro',
          {
            params: {
              MobileOS: 'ETC',
              MobileApp: 'init',
              serviceKey,
              contentId: tripDetail.contentid,
              contentTypeId: tripDetail.contenttypeid,
            },
          },
        )
        .then(async (response) => {
          console.log(response.data.response);
          if (response.data.response.header.resultCode == 22) {
            return;
          }
          /////// 없으면 그냥 불러오고 바로 DB에 저장
          const detailInfoFromAPI = response.data.response.body.items.item;
          let dataToSave = this.tripDetails.create({
            ...detailInfoFromAPI,
            location: tripDetail,
          });
          /////// 저장 코드 끝

          /////// key값에서 데이터 정제
          const detailInfoKeys = Object.keys(detailInfoFromAPI);
          for (const key of detailInfoKeys) {
            if (key.includes('restdate')) {
              tripDetail['restdate'] = detailInfoFromAPI[key];
            } else if (key.includes('usetime') || key.includes('opentime')) {
              tripDetail['opentime'] = detailInfoFromAPI[key];
            } else if (key.includes('infocenter')) {
              tripDetail['infocenter'] = detailInfoFromAPI[key];
            }
          }
          /////// key값에서 데이터 정제

          await axios
            .get(
              'http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailCommon',
              {
                params: {
                  MobileOS: 'ETC',
                  MobileApp: 'init',
                  serviceKey,
                  contentId: tripDetail.contentid,
                  contentTypeId: tripDetail.contenttypeid,
                  defaultYN: 'Y',
                  overviewYN: 'Y',
                },
              },
            )
            .then(async (response) => {
              console.log(response.data.response);
              if (response.data.response.header.resultCode == 22) {
                return;
              }
              /////// 없으면 그냥 불러오고 바로 DB에 저장
              const commonDetailInfoFromAPI =
                response.data.response.body.items.item;

              dataToSave = Object.assign(dataToSave, commonDetailInfoFromAPI);
              await this.tripDetails.save(dataToSave);
              /////// 저장 코드 끝

              /////// key값에서 데이터 정제
              const commonDetailInfoKeys = Object.keys(commonDetailInfoFromAPI);

              if (commonDetailInfoKeys.includes('homepage')) {
                tripDetail['homepage'] = commonDetailInfoFromAPI['homepage'];
              }
              if (commonDetailInfoKeys.includes('overview')) {
                tripDetail['overview'] = commonDetailInfoFromAPI['overview'];
              }
              /////// key값에서 데이터 정제
            });
        });
    } else {
      /////// 위쪽 코드랑 겹치니까 함수로 따로 빼자
      const detailInfoKeys = Object.keys(detailInfo);
      for (const key of detailInfoKeys) {
        if (key.includes('restdate') && detailInfo[key] !== null) {
          tripDetail['restdate'] = detailInfo[key];
        } else if (
          (key.includes('usetime') || key.includes('opentime')) &&
          detailInfo[key] !== null
        ) {
          tripDetail['opentime'] = detailInfo[key];
        } else if (key.includes('infocenter') && detailInfo[key] !== null) {
          tripDetail['infocenter'] = detailInfo[key];
        }
      }

      if (detailInfoKeys.includes('homepage')) {
        tripDetail['homepage'] = detailInfo['homepage'];
      }
      if (detailInfoKeys.includes('overview')) {
        tripDetail['overview'] = detailInfo['overview'];
      }
      /////// 위쪽 코드랑 겹치니까 함수로 따로 빼자
    }

    return { ok: true, tripDetail };
    // return { ok: true, tripDetail };
  }
}
