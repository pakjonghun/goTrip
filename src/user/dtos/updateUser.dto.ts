import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { IsNumber, IsString, Length, Matches } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from '../entities/user.entity';

export class UpdateUserDTO extends PartialType(
  PickType(User, ['checkPassword', 'phoneNumber', 'pwd', 'email']),
) {
  @IsString({ message: '올바른 닉네임 형식이 아닙니다.' })
  @Matches(/^[[ㄱ-ㅎㅏ-ㅣ가-힣a-z0-9!-=\S]*$/i, {
    message: '닉네임은 형식에 맞는 값을 사용하세요.',
  })
  @Length(2, 15, { message: '닉네임을 2글자 이상 15글자 이하로 입력하세요' })
  nickName?: string;
}

export class UpdateUserProtoType extends UpdateUserDTO {
  @IsNumber()
  id: number;
}

export class UpdateUserOutput extends CommonOutput {}
