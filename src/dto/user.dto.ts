import { ApiProperty } from '@nestjs/swagger';
import { UserObject } from '../interface/user.object.interface';

export class UserDto {
  @ApiProperty({ description: 'User ID' })
  readonly userId: string;

  @ApiProperty({ description: 'User email' })
  readonly email: string;

  @ApiProperty({ description: 'User first name' })
  readonly firstName: string;

  @ApiProperty({ description: 'User last name' })
  readonly lastName: string;

  @ApiProperty({ description: 'User role', enum: ['user', 'admin', 'manager'] })
  readonly role: 'user' | 'admin' | 'manager';

  constructor(user: UserObject, userId: string) {
    this.userId = userId;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.role = user.role;
  }
}
