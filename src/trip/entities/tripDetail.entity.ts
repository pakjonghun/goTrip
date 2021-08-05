import { IsOptional } from 'class-validator';
import { CoreEntity } from 'src/common/entities/coreEntity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TripDetail extends CoreEntity {
  @Column({ nullable: true })
  @IsOptional()
  homepage?: string;
  @Column({ nullable: true })
  @IsOptional()
  tel?: string;
  @Column({ nullable: true })
  @IsOptional()
  telname?: string;
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
  accomcountlodging?: string;
  @Column({ nullable: true })
  @IsOptional()
  benikia?: string;
  @Column({ nullable: true })
  @IsOptional()
  checkintime?: string;
  @Column({ nullable: true })
  @IsOptional()
  checkouttime?: string;
  @Column({ nullable: true })
  @IsOptional()
  chkcooking?: string;
  @Column({ nullable: true })
  @IsOptional()
  foodplace?: string;
  @Column({ nullable: true })
  @IsOptional()
  goodstay?: string;
  @Column({ nullable: true })
  @IsOptional()
  hanok?: string;
  @Column({ nullable: true })
  @IsOptional()
  infocenterlodging?: string;
  @Column({ nullable: true })
  @IsOptional()
  parkinglodging?: string;
  @Column({ nullable: true })
  @IsOptional()
  pickup?: string;
  @Column({ nullable: true })
  @IsOptional()
  roomcount?: string;
  @Column({ nullable: true })
  @IsOptional()
  reservationlodging?: string;
  @Column({ nullable: true })
  @IsOptional()
  reservationurl?: string;
  @Column({ nullable: true })
  @IsOptional()
  roomtype?: string;
  @Column({ nullable: true })
  @IsOptional()
  refundregulation?: string;
  @Column({ nullable: true })
  @IsOptional()
  scalelodging?: string;
  @Column({ nullable: true })
  @IsOptional()
  subfacility?: string;
  @Column({ nullable: true })
  @IsOptional()
  barbecue?: string;
  @Column({ nullable: true })
  @IsOptional()
  beauty?: string;
  @Column({ nullable: true })
  @IsOptional()
  beverage?: string;
  @Column({ nullable: true })
  @IsOptional()
  bicycle?: string;
  @Column({ nullable: true })
  @IsOptional()
  campfire?: string;
  @Column({ nullable: true })
  @IsOptional()
  fitness?: string;
  @Column({ nullable: true })
  @IsOptional()
  karaoke?: string;
  @Column({ nullable: true })
  @IsOptional()
  publicbath?: string;
  @Column({ nullable: true })
  @IsOptional()
  publicpc?: string;
  @Column({ nullable: true })
  @IsOptional()
  sauna?: string;
  @Column({ nullable: true })
  @IsOptional()
  seminar?: string;
  @Column({ nullable: true })
  @IsOptional()
  Sports?: string;
  @Column({ nullable: true })
  @IsOptional()
  chkbabycarriageshopping?: string;
  @Column({ nullable: true })
  @IsOptional()
  chkcreditcardshopping?: string;
  @Column({ nullable: true })
  @IsOptional()
  chkpetshopping?: string;
  @Column({ nullable: true })
  @IsOptional()
  culturecenter?: string;
  @Column({ nullable: true })
  @IsOptional()
  fairday?: string;
  @Column({ nullable: true })
  @IsOptional()
  infocentershopping?: string;
  @Column({ nullable: true })
  @IsOptional()
  opendateshopping?: string;
  @Column({ nullable: true })
  @IsOptional()
  opentime?: string;
  @Column({ nullable: true })
  @IsOptional()
  parkingshopping?: string;
  @Column({ nullable: true })
  @IsOptional()
  restdateshopping?: string;
  @Column({ nullable: true })
  @IsOptional()
  restroom?: string;
  @Column({ nullable: true })
  @IsOptional()
  saleitem?: string;
  @Column({ nullable: true })
  @IsOptional()
  saleitemcost?: string;
  @Column({ nullable: true })
  @IsOptional()
  scaleshopping?: string;
  @Column({ nullable: true })
  @IsOptional()
  shopguide?: string;
  @Column({ nullable: true })
  @IsOptional()
  chkcreditcardfood?: string;
  @Column({ nullable: true })
  @IsOptional()
  discountinfofood?: string;
  @Column({ nullable: true })
  @IsOptional()
  firstmenu?: string;
  @Column({ nullable: true })
  @IsOptional()
  infocenterfood?: string;
  @Column({ nullable: true })
  @IsOptional()
  kidsfacility?: string;
  @Column({ nullable: true })
  @IsOptional()
  opendatefood?: string;
  @Column({ nullable: true })
  @IsOptional()
  opentimefood?: string;
  @Column({ nullable: true })
  @IsOptional()
  packing?: string;
  @Column({ nullable: true })
  @IsOptional()
  parkingfood?: string;
  @Column({ nullable: true })
  @IsOptional()
  reservationfood?: string;
  @Column({ nullable: true })
  @IsOptional()
  restdatefood?: string;
  @Column({ nullable: true })
  @IsOptional()
  scalefood?: string;
  @Column({ nullable: true })
  @IsOptional()
  seat?: string;
  @Column({ nullable: true })
  @IsOptional()
  smoking?: string;
  @Column({ nullable: true })
  @IsOptional()
  treatmenu?: string;
  @Column({ nullable: true })
  @IsOptional()
  lcnsno?: string;
}
