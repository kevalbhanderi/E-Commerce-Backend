import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../../../dto/user.dto';
import { UserObject } from '../../../../interface/user.object.interface';

export class RegisterResponseDto extends UserDto {
  @ApiProperty({ description: 'JWT authentication token' })
  readonly token: string;

  constructor(user: UserObject, userId: string, token: string) {
    super(user, userId);
    this.token = token;
  }
}
