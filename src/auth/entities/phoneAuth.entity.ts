import { IsString, Length, Matches } from 'class-validator';
import { CoreEntity } from 'src/common/entities/coreEntity';
import { User } from 'src/user/entities/user.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class PhoneAuthEntity extends CoreEntity {
  @IsString({ message: '형식에 맞는 값을 입력하세요' })
  @Column()
  code: number;

  @IsString({ message: '형식에 맞는 값을 입력하세요' })
  @Matches(/^[0-9]{11}$/i, { message: '휴대폰 번호는 11자리 입니다.' })
  @Column({ unique: true })
  phoneNumber: string;

  @ManyToOne((type) => User, (User) => User.codes)
  user?: User;

  @BeforeUpdate()
  @BeforeInsert()
  insertCode() {
    this.code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  }
}
