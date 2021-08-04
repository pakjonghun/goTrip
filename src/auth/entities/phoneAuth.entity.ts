import { CoreEntity } from 'src/common/entities/coreEntity';
import { Column, Entity } from 'typeorm';

@Entity()
export class PhoneAuthEntity extends CoreEntity {
  @Column()
  code: number;

  @Column()
  phoneNumber: string;
}
