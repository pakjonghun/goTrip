import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { GeoService } from 'src/geo/geo.service';
import { Repository } from 'typeorm';
import { GetCourseProcessOutput } from './dtos/get-course-process.dto';
import { GetCourseInput, GetCourseOutput } from './dtos/get-course.dto';
import { AreaCode } from './entities/areacode.entity';
import { Course } from './entities/course.entity';
import { Location } from './entities/location.entity';

@Injectable()
export class TripService {
  constructor(
    private readonly geoService: GeoService,
    @InjectRepository(Course) private readonly courses: Repository<Course>,
    @InjectRepository(Location)
    private readonly locations: Repository<Location>,
    @InjectRepository(AreaCode)
    private readonly areacodes: Repository<AreaCode>,
  ) {}

  async getCourse(getCourseInput: GetCourseInput): Promise<GetCourseOutput> {
    const { lat, lng, areaCode, contenttypeid, startDate, category } =
      getCourseInput;

    const data = await this.geoService.getWithInKm(
      lat,
      lng,
      200,
      areaCode,
      contenttypeid,
      category,
    );

    // 코스 저장하는 코드

    return { ok: true, data };
  }

  async getCourseProcess(contentid: number): Promise<GetCourseProcessOutput> {
    const courseProcess = await this.locations.find({ contentid });
    return { ok: true, courseProcess };
  }

  async moveAreaCodes() {
    await axios.get('http://localhost:4000/detail/move').then(async (res) => {
      const data = res.data;
      for (const i of data) {
        await this.areacodes.save(
          this.areacodes.create({ code: i.code, name: i.name }),
        );
      }
    });
  }

  async moveData() {
    await axios.get('http://localhost:4000/detail/move').then(async (res) => {
      const data = res.data;

      for (const obj of data) {
        for (const loketsi of obj.course) {
          console.log(loketsi);
          const newLoketsi = this.locations.create({
            contentid: loketsi.contentid,
            subcontentid: loketsi.subcontentid,
            contenttypeid: loketsi.contenttypeid,
            name: loketsi.subname,
            overview: loketsi.subdetailoverview,
            img: loketsi.subdetailimg,
          });

          await this.locations.save(newLoketsi);
        }

        const newObj = this.courses.create({
          contentid: obj.commonDetail[0].contentid,
          contenttypeid: obj.commonDetail[0].contenttypeid,
          areacode: obj.commonDetail[0].areacode,
          title: obj.commonDetail[0].title,
          overview: obj.commonDetail[0].overview,
          cat1: obj.commonDetail[0].cat1,
          cat2: obj.commonDetail[0].cat2,
          cat3: obj.commonDetail[0].cat3,
          firstimage: obj.commonDetail[0].firstimage,
          firstimage2: obj.commonDetail[0].firstimage2,
          mapx: obj.commonDetail[0].mapx + '',
          mapy: obj.commonDetail[0].mapy + '',
          mlevel: obj.commonDetail[0].mlevel,
          sigungucode: obj.commonDetail[0].sigungucode,
          length: obj.introduceDetail[0].distance,
          taketime: obj.introduceDetail[0].taketime,
        });

        console.log(newObj);
        await this.courses.save(newObj);
      }
    });
  }
}
