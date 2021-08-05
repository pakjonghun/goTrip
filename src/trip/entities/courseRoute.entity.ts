import { IsOptional } from 'class-validator';
import { CoreEntity } from 'src/common/entities/coreEntity';
import { Column, Entity } from 'typeorm';

@Entity()
export class CourseRouteEntity extends CoreEntity {
  @Column({ nullable: true })
  @IsOptional()
  contentid?: string;
  @Column({ nullable: true })
  @IsOptional()
  contenttypeid?: string;
  @Column({ nullable: true })
  @IsOptional()
  fldgubun?: string;
  @Column({ nullable: true })
  @IsOptional()
  infoname?: string;
  @Column({ nullable: true })
  @IsOptional()
  infotext?: string;
  @Column({ nullable: true })
  @IsOptional()
  serialnum?: string;
  @Column({ nullable: true })
  @IsOptional()
  subcontentid?: string;
  @Column({ nullable: true })
  @IsOptional()
  subdetailalt?: string;
  @Column({ nullable: true })
  @IsOptional()
  subdetailimg?: string;
  @Column({ nullable: true })
  @IsOptional()
  subdetailoverview?: string;
  @Column({ nullable: true })
  @IsOptional()
  subname?: string;
  @Column({ nullable: true })
  @IsOptional()
  subnum?: string;
}
