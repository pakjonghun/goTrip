import { PickType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/coreEntity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Location extends PickType(CoreEntity, ['id']) {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsOptional()
  @IsNumber()
  contentid: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsNumber()
  subcontentid: number;

  @Column()
  @IsOptional()
  @IsNumber()
  contenttypeid: number;

  @Column()
  @IsOptional()
  @IsString()
  name: string;

  @Column()
  @IsOptional()
  @IsString()
  overview: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  img: string;
}
