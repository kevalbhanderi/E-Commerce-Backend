import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
import { ProfileService } from './profile.service';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { AuthGuard } from 'src/guard/auth.guard';
import { User } from 'src/decorators/user.decorator';
import type { JwtTokenInterface } from 'src/interface/jwt.token.interface';

@Controller('profile')
@UseGuards(AuthGuard)
@ApiSecurity('x-access-token')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({
    summary: 'Get User Profile',
  })
  @ApiParam({
    name: 'userId',
    required: false,
    description:
      'Optional user ID.So, Admins can provide any userId, regular users can only provide their own userId.',
  })
  @ApiOkResponse({
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Cannot view other users profile',
  })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Get('/:userId')
  async getProfile(
    @User() userInfo: JwtTokenInterface,
    @Param('userId') userId?: string,
  ): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(userInfo, userId);
  }
}
