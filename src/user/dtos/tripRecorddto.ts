import { OmitType } from '@nestjs/swagger';
import { TripRecord } from '../entities/tripRecord.entity';

export class TripRecordDTO extends OmitType(TripRecord, [
  'createdAt',
  'id',
  'updatedAt',
]) {}
