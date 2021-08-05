import { IsOptional } from 'class-validator';
import { CoreEntity } from 'src/common/entities/coreEntity';
import { Column, Entity } from 'typeorm';

@Entity()
export class CourseRouteEntity extends CoreEntity {
  @Column({ nullable: true })
  @IsOptional()
  @Column({ nullable: true })
  contentid?: string;

  @Column({ nullable: true })
  @IsOptional()
  imagename?: string;

  @IsOptional()
  @Column({ nullable: true })
  originimg?: string;

  @Column({ nullable: true })
  @IsOptional()
  url?: string;

  @IsOptional()
  @Column({ nullable: true })
  serialnum?: string;

  @IsOptional()
  @Column({ nullable: true })
  smallimageurl?: string;
}
