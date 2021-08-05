import { IsOptional } from 'class-validator';
import { CoreEntity } from 'src/common/entities/coreEntity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from './course.entity';
import { Location } from './location.entity';

@Entity()
export class TripDetail extends CoreEntity {
  @ManyToOne((type) => Course, (Course) => Course.tripDetail, {
    onDelete: 'CASCADE',
  })
  course: Course;

  @ManyToOne((type) => Location, (Location) => Location.tripDetail, {
    onDelete: 'CASCADE',
  })
  location: Location;

  @Column({ nullable: true, unique: true })
  @IsOptional()
  contentid?: string;

  @Column({ nullable: true })
  @IsOptional()
  contenttypeid?: string;

  @Column({ nullable: true })
  @IsOptional()
  accomcount?: string;

  @Column({ nullable: true })
  @IsOptional()
  chkbabycarriage?: string;

  @Column({ nullable: true })
  @IsOptional()
  chkcreditcard?: string;

  @Column({ nullable: true })
  @IsOptional()
  chkpet?: string;

  @Column({ nullable: true })
  @IsOptional()
  expagerange?: string;

  @Column({ nullable: true })
  @IsOptional()
  expguide?: string;

  @Column({ nullable: true })
  @IsOptional()
  heritage1?: string;

  @Column({ nullable: true })
  @IsOptional()
  heritage2?: string;

  @Column({ nullable: true })
  @IsOptional()
  heritage3?: string;

  @Column({ nullable: true })
  @IsOptional()
  infocenter?: string;

  @Column({ nullable: true })
  @IsOptional()
  opendate?: string;

  @Column({ nullable: true })
  @IsOptional()
  parking?: string;

  @Column({ nullable: true })
  @IsOptional()
  restdate?: string;

  @Column({ nullable: true })
  @IsOptional()
  useseason?: string;

  @Column({ nullable: true })
  @IsOptional()
  usetime?: string;

  @Column({ nullable: true })
  @IsOptional()
  accomcountculture?: string;

  @Column({ nullable: true })
  @IsOptional()
  chkbabycarriageculture?: string;

  @Column({ nullable: true })
  @IsOptional()
  chkcreditcardculture?: string;

  @Column({ nullable: true })
  @IsOptional()
  chkpetculture?: string;

  @Column({ nullable: true })
  @IsOptional()
  discountinfo?: string;

  @Column({ nullable: true })
  @IsOptional()
  infocenterculture?: string;

  @Column({ nullable: true })
  @IsOptional()
  parkingculture?: string;

  @Column({ nullable: true })
  @IsOptional()
  parkingfee?: string;

  @Column({ nullable: true })
  @IsOptional()
  restdateculture?: string;

  @Column({ nullable: true })
  @IsOptional()
  usefee?: string;

  @Column({ nullable: true })
  @IsOptional()
  usetimeculture?: string;

  @Column({ nullable: true })
  @IsOptional()
  scale?: string;

  @Column({ nullable: true })
  @IsOptional()
  spendtime?: string;

  @Column({ nullable: true })
  @IsOptional()
  agelimit?: string;

  @Column({ nullable: true })
  @IsOptional()
  bookingplace?: string;

  @Column({ nullable: true })
  @IsOptional()
  discountinfofestival?: string;

  @Column({ nullable: true })
  @IsOptional()
  eventenddate?: string;

  @Column({ nullable: true })
  @IsOptional()
  eventhomepage?: string;

  @Column({ nullable: true })
  @IsOptional()
  eventplace?: string;

  @Column({ nullable: true })
  @IsOptional()
  eventstartdate?: string;

  @Column({ nullable: true })
  @IsOptional()
  festivalgrade?: string;

  @Column({ nullable: true })
  @IsOptional()
  placeinfo?: string;

  @Column({ nullable: true })
  @IsOptional()
  playtime?: string;

  @Column({ nullable: true })
  @IsOptional()
  program?: string;

  @Column({ nullable: true })
  @IsOptional()
  spendtimefestival?: string;

  @Column({ nullable: true })
  @IsOptional()
  sponsor1?: string;

  @Column({ nullable: true })
  @IsOptional()
  sponsor1tel?: string;

  @Column({ nullable: true })
  @IsOptional()
  sponsor2?: string;

  @Column({ nullable: true })
  @IsOptional()
  sponsor2tel?: string;

  @Column({ nullable: true })
  @IsOptional()
  subevent?: string;

  @Column({ nullable: true })
  @IsOptional()
  usetimefestival?: string;

  @Column({ nullable: true })
  @IsOptional()
  distance?: string;

  @Column({ nullable: true })
  @IsOptional()
  infocentertourcourse?: string;

  @Column({ nullable: true })
  @IsOptional()
  schedule?: string;

  @Column({ nullable: true })
  @IsOptional()
  taketime?: string;

  @Column({ nullable: true })
  @IsOptional()
  theme?: string;

  @Column({ nullable: true })
  @IsOptional()
  accomcountleports?: string;

  @Column({ nullable: true })
  @IsOptional()
  chkbabycarriageleports?: string;

  @Column({ nullable: true })
  @IsOptional()
  chkcreditcardleports?: string;

  @Column({ nullable: true })
  @IsOptional()
  chkpetleports?: string;

  @Column({ nullable: true })
  @IsOptional()
  expagerangeleports?: string;

  @Column({ nullable: true })
  @IsOptional()
  infocenterleports?: string;

  @Column({ nullable: true })
  @IsOptional()
  openperiod?: string;

  @Column({ nullable: true })
  @IsOptional()
  parkingfeeleports?: string;

  @Column({ nullable: true })
  @IsOptional()
  parkingleports?: string;

  @Column({ nullable: true })
  @IsOptional()
  reservation?: string;

  @Column({ nullable: true })
  @IsOptional()
  restdateleports?: string;

  @Column({ nullable: true })
  @IsOptional()
  scaleleports?: string;

  @Column({ nullable: true })
  @IsOptional()
  usefeeleports?: string;

  @Column({ nullable: true })
  @IsOptional()
  usetimeleports?: string;

  @Column({ nullable: true })
  @IsOptional()
  mapx?: string;

  @Column({ nullable: true })
  @IsOptional()
  mapy?: string;

  @Column({ nullable: true })
  @IsOptional()
  tel?: string;

  @Column({ nullable: true })
  @IsOptional()
  telname?: string;

  @Column({ nullable: true })
  @IsOptional()
  firstimage?: string;

  @Column({ nullable: true })
  @IsOptional()
  overview?: string;

  @Column({ nullable: true })
  @IsOptional()
  homepage?: string;
}
