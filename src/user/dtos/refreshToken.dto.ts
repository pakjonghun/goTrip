import { CommonOutput } from 'src/common/dtos/common.dto';

export class RefreshTokenOutput extends CommonOutput {
  activeToken?: string;
}
