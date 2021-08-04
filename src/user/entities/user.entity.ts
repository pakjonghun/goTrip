import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { CoreEntity } from 'src/common/entities/coreEntity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Entity()
@Injectable()
export class User extends CoreEntity {
  @Column({ unique: true })
  @IsString({ message: '올바른 닉네임 형식이 아닙니다.' })
  @Matches(/^[a-z0-9!-=\S]*$/i, {
    message: '닉네임은 형식에 맞는 값을 사용하세요.',
  })
  @Length(3, 15, { message: '닉네임을 3글자 이상 15글자 이하로 입력하세요' })
  nickName: string;

  @Column({ unique: true, nullable: true })
  @IsOptional()
  @IsEmail({}, { message: '이메일 형식을 입력하세요.' })
  email?: string;

  @Column({ nullable: true, select: false })
  @Length(8, 40, { message: '비밀번호는 8~40로 입력하세요' })
  @Matches(/^[\S]*$/i, { message: '비밀번호에 공란은 허용되지 않습니다.' })
  @IsString({ message: '올바른 비밀번호 형식이 아닙니다.' })
  @IsOptional()
  pwd?: string;

  @Column({ nullable: true, unique: true })
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @Column({ default: false })
  varified: boolean;

  @Length(8, 40, { message: '비밀번호는 8~40로 입력하세요' })
  @IsString({ message: '올바른 비밀번호 형식이 아닙니다.' })
  @IsOptional()
  @Matches(/^[\S]*$/i, { message: '비밀번호에 공란은 허용되지 않습니다.' })
  pwdConfirm?: string;

  @Column({ nullable: true })
  @IsString({ message: '올바른 휴대폰번호 형식이 아닙니다.' })
  @IsOptional()
  @Matches(/^[0-9]{3}[-]+[0-9]{4}[-]+[0-9]{4}$/i, {
    message: '휴대폰번호를 형식에 맞게 입력하세요.',
  })
  phoneNumber?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({
    message: '올바른 소셜아이디 형식이 아닙니다. 문자열로 바꿔서 보내주세요',
  })
  socialId?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    console.log(111111111);
    console.log(this.pwd);
    if (this.pwd) {
      this.pwd = await bcrypt.hash(this.pwd, 10);
    }
  }

  async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.pwd);
  }
}
