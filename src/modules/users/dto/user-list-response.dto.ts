import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../../dto/user.dto';
import { UserObject } from '../../../interface/user.object.interface';

export class UserListItemDto extends UserDto {
  @ApiProperty({ description: 'Account creation date' })
  readonly createdAt: Date;

  @ApiProperty({ description: 'Account active status' })
  readonly isActive: boolean;

  constructor(
    user: UserObject,
    userId: string,
    createdAt: Date,
    isActive: boolean,
  ) {
    super(user, userId);
    this.createdAt = createdAt;
    this.isActive = isActive;
  }
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserListItemDto], description: 'List of users' })
  readonly users: UserListItemDto[];

  @ApiProperty({ description: 'Total number of users' })
  readonly total: number;

  @ApiProperty({ description: 'Current page number' })
  readonly page: number;

  @ApiProperty({ description: 'Number of items per page' })
  readonly limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  readonly totalPages: number;

  constructor(
    users: UserListItemDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.users = users;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
