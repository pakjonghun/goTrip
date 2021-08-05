import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AreaCode } from 'src/trip/entities/areacode.entity';
import { DetailAreaCode } from 'src/trip/entities/detailAreaCode.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Location } from 'src/trip/entities/location.entity';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(AreaCode) private readonly area: Repository<AreaCode>,
    @InjectRepository(DetailAreaCode)
    private readonly detailArea: Repository<DetailAreaCode>,
    @InjectRepository(Location) private readonly location: Repository<Location>,
  ) {
    // this.sampleDetail();
    // this.getListData();
  }

  encodeKey =
    'R1YkIepzkxhj6Ouue%2Fo0BcyXRM89NzjOU2baG8hXDjqv7MyVSxspxUBLzUZOJPISnGgxDg8SaIutpCmhB7OE%2Fg%3D%3D';

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

  getListData = async () => {
    const codes = await this.area.find({ code: 1 });
    //나중에 코드를 시군구 코드로 바꾸고, 파라미터에도 시군구 코드 추가해야됨.
    for (let i of codes) {
      const { code } = i;

      const data = await this.api.get('areaBasedList', {
        params: {
          areaCode: code,
          numOfRows: 20,
          contentTypeId: 25,
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
      return console.log(item);
      for (let j of item) {
        //contentid가 있을경우 반복하지 않도록 코드추가
        const exist = await this.location.count({ contentid: j.contentId });

        if (exist) continue;

        const {
          addr1,
          areacode,
          cat1,
          cat2,
          cat3,
          contentid,
          contenttypeid,
          createdtime,
          firstimage,
          firstimage2,
          mapx,
          mapy,
          mlevel,
          modifiedtime,
          readcount,
          sigungucode,
          title,
        } = j;

        await this.location.save({
          addr1,
          areacode,
          cat1,
          cat2,
          cat3,
          contentid,
          contenttypeid,
          createdtime,
          firstimage,
          firstimage2,
          mapx,
          mapy,
          mlevel,
          modifiedtime,
          readcount,
          sigungucode,
          title,
        });
      }
    }
  };

  async sampleDetail() {
    const data = await this.api.get('detailImage', {
      params: {
        contentId: 1265735,
        defaultYN: 'Y',
        contentTypeId: 25,
      },
    });
    console.dir(data, { depth: 30 });
  }
}

//
