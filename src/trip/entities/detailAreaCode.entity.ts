import { OmitType } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/coreEntity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AreaCode } from './areacode.entity';

@Entity()
export class DetailAreaCode extends CoreEntity {
  @Column({ nullable: true })
  @IsNumber()
  code: number;

  @Column({ nullable: true })
  @IsString()
  name: string;

  @ManyToOne((type) => AreaCode, (AreaCode) => AreaCode.detailAreaCode)
  areacode: AreaCode;
}
