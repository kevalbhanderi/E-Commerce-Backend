import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
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

  @ApiOperation({ summary: 'Get User Profile' })
  @ApiOkResponse({
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Get()
  async getProfile(
    @Headers('x-access-token') token: string,
  ): Promise<ProfileResponseDto> {
    const userInfo = await this.jwtHelper.verify(token);
    if (!userInfo) {
      throw new Error('Invalid token');
    }
    return this.profileService.getProfile(userInfo);
  }
}
