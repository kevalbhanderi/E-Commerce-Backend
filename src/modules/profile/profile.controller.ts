import { Controller, Get, Headers, Param, UseGuards } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { AuthGuard } from 'src/guard/auth.guard';
import { JwtHelper } from 'src/utils/jwt.helper';

@Controller('profile')
@UseGuards(AuthGuard)
@ApiSecurity('x-access-token')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly jwtHelper: JwtHelper,
  ) {}

  @ApiOperation({
    summary: 'Get User Profile',
  })
  @ApiParam({
    name: 'userId',
    required: false,
    description:
      'User ID to view profile. Required for admin to view other users.',
  })
  @ApiOkResponse({
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Get('/:userId')
  async getProfile(
    @Headers('x-access-token') token: string,
    @Param('userId') userId?: string,
  ): Promise<ProfileResponseDto> {
    const userInfo = await this.jwtHelper.verify(token);
    if (!userInfo) {
      throw new Error('Invalid token');
    }
    return this.profileService.getProfile(userInfo, userId);
  }
}
