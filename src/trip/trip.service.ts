import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { GeoService } from 'src/geo/geo.service';
import { Repository } from 'typeorm';
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
      // 목적지가 있을 시..
      if (smallAreaCode) {
        /////// 도를 선택했을 시 시군구코드 포함해서 검색
        coursesFromDB = await this.courses
          .createQueryBuilder()
          .where('areacode = :wideAreaCode', { wideAreaCode })
          .andWhere('sigungucode = :smallAreaCode', { smallAreaCode })
          .andWhere('cat2 IN (:...courseOptions)', { courseOptions })
          .getMany();
      } else {
        /////// 광역시를 선택했을 시 시군구코드 포함 X
        coursesFromDB = await this.courses
          .createQueryBuilder()
          .where('areacode = :wideAreaCode', { wideAreaCode })
          .andWhere('cat2 IN (:...courseOptions)', { courseOptions })
          .getMany();
      }
    } else {
      // 목적지가 없을 시 : 출발 지역으로부터 200km이내에 있는 지역들의 코스를 검색
      coursesFromDB = await this.courses
        .createQueryBuilder()
        .where('areacode IN (:...wideAreaCode)', {
          wideAreaCode: NEAR_AREA[startAreaCode], // 출발 지역에서 200km 이내에 있는 지역들의 코드, trip.constants.ts 파일을 참조해주세요
        })
        .andWhere('cat2 IN (:...courseOptions)', { courseOptions })
        .getMany();
    }

    for (const poppedCourse of coursesFromDB) {
      // 이 반복문이 매우 오래 걸림. 성능 개선 필요.
      // poppedCourse

      poppedCourse['course'] = [];

      // 뽑은 코스에 해당하는 관광지들 아이디 추출
      const courseRouteArr = await this.courseRoutes.find({
        contentid: poppedCourse.contentid,
      });

      // 알찬 스케쥴을 선택하면 속하는 관광지가 5개를 넘어가는 코스만 추출
      // 느긋한 스케쥴을 선택하면 속하는 관광지가 4개 이하인 코스만 추출
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

      // 코스 객체에 관광지들 데이터 추가
      for (const i of courseRouteArr) {
        const contentid = +i.subcontentid;

        const locationInRoute = await this.locations.findOne({ contentid });

        if (!locationInRoute) {
          continue;
        }

        poppedCourse.course.push(locationInRoute);
      }
    }

    // 스타일과 옵션을 다 만족하는 코스만 남긴다
    coursesFromDB = coursesFromDB.filter((course) => {
      for (const location of course.course) {
        if (locationOptions.includes(location.cat2)) {
          return true;
        }
      }
    });

    // 남은 코스들 중에 랜덤으로 하나를 뽑는다
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

    // 날짜 정해주기
    if (!startDate) {
      // 만약 사용자가 날짜를 정하지 않았다면, wishWeek주 내의 랜덤한 날짜 배정
      const randomNumberForStartDate = Math.floor(
        Math.random() * wishWeek * 7 + 1,
      );

      const myDate = new Date();

      myDate.setDate(myDate.getDate() + randomNumberForStartDate);

      poppedCourse['startDate'] = myDate;
    } else {
      poppedCourse['startDate'] = new Date(startDate);
    }

    // 여기서부터는 What else를 넣어주기 위한 코드들입니다.
    // What else의 선택기준은 최종적으로 뽑힌 코스에 속한 관광지들과 비슷한 성격의 관광지들입니다.
    // 따라서 속한 관광지들과 같은 cat3(소분류)를 가진 같은 지역의 관광지들을 랜덤하게 10개씩 뽑아서 줍니다.
    // 근데 보내줄 때의 키 값은 중분류로 보내줍니다.
    const locationOptionsInPoppedCourse = [];

    for (const locationElement of poppedCourse.course) {
      locationOptionsInPoppedCourse.push(locationElement.cat3);
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

  async getTripDetail(contentid: number) {
    // What else에서 일정추가 버튼 눌렀을 때, 디테일한 정보를 보여주기 위한 API입니다
    // 기본 관광지 정보에 쉬는 날, 개장시간, 전화번호, 주소, 오버뷰 이렇게 추가로 들어갑니다.
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
          /////// 없으면 그냥 API에서 불러오고 바로 DB에 저장
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
  }
}
