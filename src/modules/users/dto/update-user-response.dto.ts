import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../../dto/user.dto';
import { UserObject } from '../../../interface/user.object.interface';

export class UpdateUserResponseDto extends UserDto {
  @ApiProperty({ description: 'User creation date' })
  readonly createdAt: Date;

  @ApiProperty({ description: 'User last update date' })
  readonly updatedAt: Date;

  @ApiProperty({ description: 'User active status' })
  readonly isActive: boolean;

  constructor(
    user: UserObject,
    userId: string,
    createdAt: Date,
    updatedAt: Date,
    isActive: boolean,
  ) {
    super(user, userId);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isActive = isActive;
  }
}
