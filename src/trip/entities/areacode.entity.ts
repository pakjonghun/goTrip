import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DetailAreaCode } from './detailAreaCode.entity';

@Entity()
export class AreaCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNumber()
  code: number;

  @Column()
  @IsString()
  name: string;

  @OneToMany(
    (type) => DetailAreaCode,
    (DetailAreaCode) => DetailAreaCode.areacode,
  )
  detailAreaCode: DetailAreaCode[];
}
