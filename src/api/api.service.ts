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
    //먼저 25번 코드로 코스 엔티티를 채우는데
    //추천코스 관광정보는
    //채우면서 디테일 3개를 받아오면서 관계를 맺으면서 채워야 한다.
    // this.getCourseData();
    this.getLocationUpdate();
    // this.sampleLocation();
    // this.sampleDetail();
    // 2384832 25
  }

  //추천코스 관광지 정보와 디테일 정보를 모두 채워 넣는 매서드(지우는거 없다 모두 업데이트 함. 없으면 만들고 있으면 업뎃)
  async getCourseData() {
    //지역코드 갖고와서(일단 시군구 제외 도단위 코드)
    const codes = await this.area.find({});

    //반복문으로 지역기반 관광지 정보를 받아와서
    for (let i of codes) {
      const data = await this.api.get('areaBasedList', {
        params: {
          contentTypeId: 25,
          numOfRows: 20,
          pageNo: 2,
          areaCode: i.code,
        },
      });
      console.log(i.id);
      const {
        data: {
          response: {
            body: {
              items: { item },
            },
          },
        },
      } = data;
      //정보 1개는 저장 안해준다. 중간에 멈추도록 해놨으니 2개 이상으로 테스트 해라.
      if (!item) continue;
      if (!item.length) continue;

      //받아온 관광지(이 관광지는 모두 추천코스 입니다.) 정보들을 다시 반복문으로 돌려서
      for (let j of item) {
        //왜 있는지 확인하냐면 지우고 다시 받거나 할 경우 id가 날라가서 관계 자체가 사라진다.(데이터가 날라감)
        //그래서 있는지 확인하고 없으면 만들고 있으면 업데이트만 시켜준다. 절대로 관계가 사라질 일은 없다.

        let courseExist = await this.course.findOne(
          { contentid: j.contentid },
          { select: ['id'] },
        );
        if (courseExist) {
          for (let q in j) {
            courseExist[q] = j[q];
          }
        } else {
          courseExist = j;
        }
        //코스엔티티에 저장한다
        const courseSave = await this.course.save(courseExist);
        //공통 디테일 정보도 동일하게 검색해서 업데이트 한다. 다른점은 위에서 저장한 코스를 관계를 맺어준다.는 점이다.
        const tripdetailData = await this.getDetail(
          'detailCommon',
          Number(j.contentid),
        );
        if (!tripdetailData) continue;

        let tripDetailDetailExist = await this.tripDetail.findOne(
          { contentid: tripdetailData.contentid },
          { select: ['id'] },
        );

        if (tripDetailDetailExist) {
          for (let q in tripdetailData) {
            tripDetailDetailExist[q] = tripdetailData[q];
          }
        } else {
          tripDetailDetailExist = tripdetailData;
        }

        //바로 여기서 관계를 맺어준다.
        tripDetailDetailExist.course = courseSave;
        await this.tripDetail.save(tripDetailDetailExist);

        //이번엔 소개정보를 업데이트 한다. 소개정보는 관광지 타입을 안주면 안뜬다 꼭 25 준다.
        const tripdetailData2 = await this.getDetail(
          'detailIntro',
          Number(j.contentid),
          25,
        );
        if (!tripdetailData2) continue;
        let tripDetailDetailExist2 = await this.tripDetail.findOne(
          { contentid: tripdetailData2.contentid },
          { select: ['id'] },
        );

        if (tripDetailDetailExist2) {
          for (let q in tripdetailData2) {
            tripDetailDetailExist2[q] = tripdetailData2[q];
          }
        } else {
          tripDetailDetailExist2 = tripdetailData2;
        }

        //이번엔 관계 또 맺어줄 필요는 없다
        await this.tripDetail.save(tripDetailDetailExist2);

        //추천코스만 해당하는 반복정보 를 넣는다. 25는 필수다 필수 25 꼭 넣자 25 밖에 없다.
        const courseRouteDetail = await this.getDetail(
          'detailInfo',
          Number(j.contentid),
          25,
        );
        if (!courseRouteDetail) continue;

        //코스루트는 배열로 뜬다. 다시 반복문을 실행해서 각각 코스 루트에 저장한다.
        for (let k of courseRouteDetail) {
          // 서브컨텐트 아이디가 중복으로 계속 나온다. 유니크 이므로 검사 해줘야 한다. ㅠ ㅠ
          // 컨텐트 아이디는 다른데 서브컨텐트 아이디가 같은 놈도 있다 진짜.. 이거는 그냥 유니크 풀어야 한다.
          const outExist = await this.courseRouter.findOne({
            contentid: k.contentid,
            subcontentid: k.subcontentid,
          });
          if (outExist) continue;

          let exist = await this.courseRouter.findOne(
            { contentid: k.contentid },
            { select: ['id'] },
          );

          if (!exist) {
            exist = k;
          } else {
            for (let i in k) {
              exist[i] = k[i];
            }
          }
          // 1921815
          //코스와 관계를 맺는다.
          exist.course = courseSave;
          await this.courseRouter.save(exist);
        }

        //마지막 이미지 정보를 받아온다. //여기서 25가 아니라 그 코스의 타입을 넣어줘야 한다. 이미지 없는것이 너무 많다. 그래도 최대한 받아보자.
        const imgs = await this.getDetail(
          'detailImage',
          Number(j.contentid),
          j.contenttypeid,
        );
        if (!imgs) continue;

        let imgExist = await this.image.findOne(
          { contentid: j.contentid },
          { select: ['id'] },
        );
        if (imgExist) {
          for (let q in imgs) {
            imgExist[q] = imgs[q];
          }
        } else {
          imgExist = imgs;
        }
        imgExist.course = courseSave;
        await this.image.save(imgExist);
      }
    }
  }

  async getDetail(url: string, contentId: number, contentTypeId?: number) {
    const data = await this.api.get(url, {
      params: {
        contentId,
        ...(contentTypeId && { contentTypeId }),
        defaultYN: 'Y',
        firstImageYN: 'Y',
        areacodeYN: 'Y',
        catcodeYN: 'Y',
        addrinfoYN: 'Y',
        mapinfoYN: 'Y',
        overviewYN: 'Y',
        introYN: 'Y',
        imageYN: 'Y',
      },
    });
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
  }

  encodeKey =
    'DbTqTFQ01Byhsb85l08hrTaU8NhtcBaNcLw4Np%2BTT6tUsxKDoIgNxTFqMEH5NBK9NuGYxAgwL6WQf6ODDGBUeg%3D%3D';
  // encodeKey =
  //   'R1YkIepzkxhj6Ouue%2Fo0BcyXRM89NzjOU2baG8hXDjqv7MyVSxspxUBLzUZOJPISnGgxDg8SaIutpCmhB7OE%2Fg%3D%3D';

  serviceKey = decodeURIComponent(this.encodeKey);

  api = axios.create({
    baseURL: 'http://api.visitkorea.or.kr/openapi/service/rest/KorService',
    params: {
      serviceKey: this.serviceKey,
      MobileOS: 'ETC',
      MobileApp: 'init',
    },
  });

  //모든 지역정보를 불러와서 그 지역코드에서 디테일 지역코드를 받아와서 db에 넣어줌
  async insertAllAreaCode() {
    const all = await this.area.find({});
    for (let i of all) {
      const code = i.code;
      const arrayCode = await this.getAllAreaCode(code);
      for (let k in arrayCode) {
        const j = arrayCode[k];

        const insert = await this.detailArea.create({ ...j, areacode: i });
        await this.detailArea.save(insert);
      }
    }
  }

  //세부 지역코드만 받아오는 코드(건들지 마셈. 쓸일 없 다른 메서드에서 호출되기만함)
  async getAllAreaCode(code: number) {
    const data = await axios.get(
      'http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaCode',
      {
        params: {
          serviceKey: this.serviceKey,
          numOfRows: 50,
          pageNo: 1,
          MobileOS: 'ETC',
          MobileApp: 'gotrip',
          areaCode: code,
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
  }

  async getLocationCode() {
    const data = await this.api.get('areaCode', {
      params: {
        numOfRows: 30,
      },
    });
    const {
      data: {
        response: {
          body: {
            items: { item },
          },
        },
      },
    } = data;

    for (let i of item) {
      const { code, name } = i;
      await this.area.save({ code, name });
    }
  }

  //테스트용 샘플 메서드
  async sampleDetail() {
    const data = await this.api.get('detailImage', {
      params: {
        contentId: 1921815,
        contentTypeid: 25,
        imageYN: 'Y',
      },
    });
    console.dir(data, { depth: 30 });
  }

  //테스트용 샘플 메서드
  async sampleLocation() {
    const data = await this.api.get('areaBasedList', {
      params: {
        contentTypeId: 25,
        numOfRows: 2,
        pageNo: 3,
        areaCode: 1,
      },
    });
    const {
      data: {
        response: {
          body: {
            items: { item },
          },
        },
      },
    } = data;
    for (let i of item) {
      console.log(i.contentid);
    }
  }

  async getLocationUpdate() {
    //지역코드 갖고와서(일단 시군구 제외 도단위 코드)
    const codes = await this.area.find({});

    //반복문으로 지역기반 관광지 정보를 받아와서
    for (let i of codes) {
      const data = await this.api.get('areaBasedList', {
        params: {
          contentTypeId: 12,
          numOfRows: 20,
          pageNo: 1,
          areaCode: i.code,
        },
      });
      console.log(i.id);
      const {
        data: {
          response: {
            body: {
              items: { item },
            },
          },
        },
      } = data;
      //정보 1개는 저장 안해준다. 중간에 멈추도록 해놨으니 2개 이상으로 테스트 해라.
      if (!item) continue;
      if (!item.length) continue;

      //받아온 관광지(이번에는 로로케이션임) 정보들을 다시 반복문으로 돌려서
      for (let j of item) {
        //왜 있는지 확인하냐면 지우고 다시 받거나 할 경우 id가 날라가서 관계 자체가 사라진다.(데이터가 날라감)
        //그래서 있는지 확인하고 없으면 만들고 있으면 업데이트만 시켜준다. 절대로 관계가 사라질 일은 없다.

        let courseExist = await this.location.findOne(
          { contentid: j.contentid },
          { select: ['id'] },
        );
        if (courseExist) {
          for (let q in j) {
            courseExist[q] = j[q];
          }
        } else {
          courseExist = j;
        }
        //코스엔티티에 저장한다
        // console.log('location');
        const courseSave = await this.location.save(courseExist);
        //공통 디테일 정보도 동일하게 검색해서 업데이트 한다. 다른점은 위에서 저장한 코스를 관계를 맺어준다.는 점이다.
        const tripdetailData = await this.getDetail(
          'detailCommon',
          Number(j.contentid),
        );
        if (!tripdetailData) continue;

        let tripDetailDetailExist = await this.tripDetail.findOne(
          { contentid: tripdetailData.contentid },
          { select: ['id'] },
        );

        if (tripDetailDetailExist) {
          for (let q in tripdetailData) {
            tripDetailDetailExist[q] = tripdetailData[q];
          }
        } else {
          tripDetailDetailExist = tripdetailData;
        }

        //바로 여기서 관계를 맺어준다.
        tripDetailDetailExist.location = courseSave;
        // console.log('tripdetail');
        await this.tripDetail.save(tripDetailDetailExist);

        //이번엔 소개정보를 업데이트 한다. 소개정보는 관광지 타입을 안주면 안뜬다
        const tripdetailData2 = await this.getDetail(
          'detailIntro',
          Number(j.contentid),
          j.contenttypeid,
        );
        if (!tripdetailData2) continue;
        let tripDetailDetailExist2 = await this.tripDetail.findOne(
          { contentid: tripdetailData2.contentid },
          { select: ['id'] },
        );

        if (tripDetailDetailExist2) {
          for (let q in tripdetailData2) {
            tripDetailDetailExist2[q] = tripdetailData2[q];
          }
        } else {
          tripDetailDetailExist2 = tripdetailData2;
        }

        //이번엔 관계 또 맺어줄 필요는 없다
        // console.log('tripdetail');
        await this.tripDetail.save(tripDetailDetailExist2);

        //마지막 이미지 정보를 받아온다. //여기서 25가 아니라 그 코스의 타입을 넣어줘야 한다. 이미지 없는것이 너무 많다. 그래도 최대한 받아보자.
        const imgs = await this.getDetail(
          'detailImage',
          Number(j.contentid),
          j.contenttypeid,
        );
        if (!imgs) continue;
        if (typeof imgs == 'object') {
          await this.image.save(imgs);
          continue;
        }
        //이미지는 컨텐트 아이디가 많다. 중복허용된다 그만큼 많으면 좋지 뭐 ㅋ
        for (let q of imgs) {
          q.location = courseSave;
          // console.log('imgsave');
          await this.image.save(q);
        }
      }
    }
  }
}

//
