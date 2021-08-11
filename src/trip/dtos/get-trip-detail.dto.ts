import { IntersectionType, OmitType } from '@nestjs/swagger';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Location } from '../entities/location.entity';
import { TripDetail } from '../entities/tripDetail.entity';

export class GetTripDetailOutput extends OmitType(
  IntersectionType(Location, CommonOutput),
  [],
) {
  tripDetail?: TripDetail;
}
