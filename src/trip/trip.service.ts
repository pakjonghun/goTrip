import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { GeoService } from 'src/geo/geo.service';
import { Repository } from 'typeorm';
import { GetTripDetailOutput } from './dtos/get-trip-detail.dto';
import { GetCourseInput, GetCourseOutput } from './dtos/get-course.dto';
import { Location } from './entities/location.entity';
import { TripDetail } from './entities/tripDetail.entity';

@Injectable()
export class TripService {
  constructor(
    private readonly geoService: GeoService,
    @InjectRepository(Location)
    private readonly locations: Repository<Location>,
    @InjectRepository(TripDetail)
    private readonly tripDetails: Repository<TripDetail>,
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

  //: Promise<GetTripDetailOutput>
  async getTripDetail(contentid: number) {
    const tripDetail = await this.locations.findOne({ contentid });
    const detailInfo = await this.tripDetails.findOne({
      location: tripDetail,
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
