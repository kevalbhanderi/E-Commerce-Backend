import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';
import { UserListResponseDto } from './dto/user-list-response.dto';
import { AuthGuard } from '../../guard/auth.guard';
import { RolesGuard } from '../../guard/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../enums/role.enum';
import { User } from '../../decorators/user.decorator';
import type { JwtTokenInterface } from '../../interface/jwt.token.interface';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@ApiSecurity('x-access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: UserListResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only admin can view all users',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN)
  @Get()
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<UserListResponseDto> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.usersService.getAllUsers(pageNumber, limitNumber);
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({
    name: 'userId',
    description: 'User ID to update',
  })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UpdateUserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Put(':userId')
  async updateUser(
    @User() userInfo: JwtTokenInterface,
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    return this.usersService.updateUser(userInfo, userId, updateDto);
  }

  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiParam({
    name: 'userId',
    description: 'User ID to delete',
  })
  @ApiOkResponse({
    description: 'User deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User deleted successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only admin can delete users',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN)
  @Delete(':userId')
  async deleteUser(
    @User() userInfo: JwtTokenInterface,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.usersService.deleteUser(userInfo, userId);
  }
}
