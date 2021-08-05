import { IsOptional } from 'class-validator';
import { CoreEntity } from 'src/common/entities/coreEntity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Course } from './course.entity';
import { Location } from './location.entity';

@Entity()
export class Image extends CoreEntity {
  @Column({ nullable: true, unique: true })
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

  @ManyToOne((type) => Location, (Location) => Location.image, {
    onDelete: 'CASCADE',
  })
  location: Location;

  @ManyToOne((type) => Course, (Course) => Course.image, {
    onDelete: 'CASCADE',
  })
  course: Course;
}
