import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/coreEntity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class TripRecord extends CoreEntity {
  @ManyToOne((type) => User, (USer) => USer.tripRecord)
  user: User;

  @IsString()
  @Column()
  tripDate: string;

  @Column({ nullable: true })
  @IsString()
  comment?: string;

  @Column({ default: false })
  @IsString()
  goOrnot: boolean;

  @Column()
  @IsString()
  img: string;

  @Column({ default: '미정' })
  @IsString()
  startingPoint: string;

  @Column()
  @IsString()
  endingPoint: string;
}
