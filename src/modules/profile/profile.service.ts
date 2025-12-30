import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MongoService } from '../../modules/mongo/mongo.service';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UserObject } from '../../interface/user.object.interface';
import { JwtTokenInterface } from '../../interface/jwt.token.interface';
import { Role } from '../../enums/role.enum';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private readonly mongoService: MongoService) {}

  async getProfile(
    userInfo: JwtTokenInterface,
    requestedUserId?: string,
  ): Promise<ProfileResponseDto> {
    try {
      // Determine target user ID and validate permissions
      const targetUserId = this.resolveTargetUserId(userInfo, requestedUserId);

      // Fetch and return profile
      if (
        userInfo.role === Role.ADMIN.valueOf() &&
        targetUserId === userInfo.user_id
      ) {
        return this.getAdminProfile(targetUserId);
      }
      return this.getUserProfile(targetUserId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Error fetching profile:', error);
      throw new NotFoundException('Failed to fetch profile');
    }
  }

  private resolveTargetUserId(
    userInfo: JwtTokenInterface,
    requestedUserId?: string,
  ): string {
    if (!requestedUserId) {
      return userInfo.user_id;
    }

    // Admin can view any profile, regular users can only view their own
    if (
      userInfo.role !== Role.ADMIN.valueOf() &&
      requestedUserId !== userInfo.user_id
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this profile',
      );
    }

    return requestedUserId;
  }

  private async getAdminProfile(adminId: string): Promise<ProfileResponseDto> {
    const admin = await this.mongoService.findAdminById(adminId);

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Admin account is deactivated');
    }

    return this.buildProfileResponse(
      {
        email: admin.email,
        firstName: admin.name,
        lastName: '',
        role: admin.role,
      },
      admin._id.toString(),
      admin.createdAt,
      admin.updatedAt,
      admin.isActive,
    );
  }

  private async getUserProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.mongoService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    return this.buildProfileResponse(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      user._id.toString(),
      user.createdAt,
      user.updatedAt,
      user.isActive,
    );
  }

  private buildProfileResponse(
    userObject: UserObject,
    userId: string,
    createdAt: Date,
    updatedAt: Date,
    isActive: boolean,
  ): ProfileResponseDto {
    return new ProfileResponseDto(
      userObject,
      userId,
      createdAt,
      updatedAt,
      isActive,
    );
  }
}
