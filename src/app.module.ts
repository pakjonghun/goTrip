import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { TripSupportModule } from './trip-support/trip-support.module';
import * as Joi from 'joi';
import { User } from './user/entities/user.entity';
import { TripRecord } from './user/entities/tripRecord.entity';
import { Comment } from './trip-support/entities/comment.entity';
import { AuthModule } from './auth/auth.module';
import { TripModule } from './trip/trip.module';
import { Location } from './trip/entities/location.entity';
import { Course } from './trip/entities/course.entity';
import { AreaCode } from './trip/entities/areacode.entity';
import { TokenMiddleWare } from './auth/middleWare/token.middleWare';
import { GeoModule } from './geo/geo.module';
import { DetailAreaCode } from './trip/entities/detailAreaCode.entity';
import { PhoneAuthEntity } from './auth/entities/phoneAuth.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { ApiModule } from './api/api.module';
import { TripDetail } from './trip/entities/tripDetail.entity';
import { CourseRoute } from './trip/entities/courseRoute.entity';
import { Image } from './trip/entities/image.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        TOKEN_SECRET: Joi.string().required(),
        MY_EMAIL: Joi.string().required(),
        MAIL_KEY: Joi.string().required(),
        api: Joi.string().required(),
        NCP_serviceID: Joi.string().required(),
        NCP_accessKey: Joi.string().required(),
        NCP_secretKey: Joi.string().required(),
        hostPhoneNumber: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        PhoneAuthEntity,
        User,
        TripRecord,
        Comment,
        Location,
        Course,
        AreaCode,
        DetailAreaCode,
        TripDetail,
        CourseRoute,
        Image,
      ],
      synchronize: true,
      logging: true,
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    CommonModule,
    TripModule,
    TripSupportModule,
    GeoModule,
    ApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenMiddleWare)
      .forRoutes(
        'user/auth',
        'user/refreshtoken',
        'user/update',
        'user/updateconfirm',
        'user/changepassword',
        'user/me',
        'user/refreshtoken',
      );
  }
}
