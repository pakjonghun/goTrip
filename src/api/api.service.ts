import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AreaCode } from 'src/trip/entities/areacode.entity';
import { DetailAreaCode } from 'src/trip/entities/detailAreaCode.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Interval } from '@nestjs/schedule';
import { Location } from 'src/trip/entities/location.entity';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(AreaCode) private readonly area: Repository<AreaCode>,
    @InjectRepository(DetailAreaCode)
    private readonly detailArea: Repository<DetailAreaCode>,
    @InjectRepository(Location) private readonly location: Repository<Location>,
  ) {}

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

  async getAllB() {
    const all = await this.area.find({});
    for (let i of all) {
      const code = i.code;
      const arrayCode = await this.getB(code);
      for (let k in arrayCode) {
        const j = arrayCode[k];

        const insert = await this.detailArea.create({ ...j, areacode: i });
        await this.detailArea.save(insert);
      }
    }
  }

  async getB(code: number) {
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
}
