import { IsOptional } from 'class-validator';
import { CoreEntity } from 'src/common/entities/coreEntity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Course } from './course.entity';

@Entity()
export class CourseRoute extends CoreEntity {
  @Column({ nullable: true })
  @IsOptional()
  contentid?: string;

  @Column({ nullable: true })
  @IsOptional()
  subcontentid?: string;

  @ManyToOne((type) => Course, (Course) => Course.courseRoute, {
    onDelete: 'CASCADE',
  })
  course: Course;
}
