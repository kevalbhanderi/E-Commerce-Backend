import {
  Body,
  Controller,
  Delete,
  Headers,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';
import { AuthGuard } from 'src/guard/auth.guard';
import { JwtHelper } from 'src/utils/jwt.helper';

@Controller('users')
@UseGuards(AuthGuard)
@ApiSecurity('x-access-token')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtHelper: JwtHelper,
  ) {}

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
    @Headers('x-access-token') token: string,
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    const userInfo = await this.jwtHelper.verify(token);
    if (!userInfo) {
      throw new Error('Invalid token');
    }
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
  @Delete(':userId')
  async deleteUser(
    @Headers('x-access-token') token: string,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    const userInfo = await this.jwtHelper.verify(token);
    if (!userInfo) {
      throw new Error('Invalid token');
    }
    return this.usersService.deleteUser(userInfo, userId);
  }
}
