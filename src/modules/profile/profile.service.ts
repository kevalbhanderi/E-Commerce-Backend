import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MongoService } from 'src/modules/mongo/mongo.service';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UserObject } from 'src/interface/user.object.interface';
import { JwtTokenInterface } from 'src/interface/jwt.token.interface';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private readonly mongoService: MongoService) {}

  async getProfile(userInfo: JwtTokenInterface): Promise<ProfileResponseDto> {
    try {
      if (userInfo.role === 'admin') {
        // Get admin profile
        const admin = await this.mongoService.findAdminById(userInfo.user_id);

        if (!admin) {
          throw new NotFoundException('Admin profile not found');
        }

        if (!admin.isActive) {
          throw new UnauthorizedException('Admin account is deactivated');
        }

        // For admin, use name as firstName
        const adminObject: UserObject = {
          email: admin.email,
          firstName: admin.name,
          lastName: '', // Admin doesn't have lastName
          role: admin.role,
        };

        return new ProfileResponseDto(
          adminObject,
          admin._id.toString(),
          admin.createdAt,
          admin.updatedAt,
          admin.isActive,
        );
      } else {
        // Get user profile
        const user = await this.mongoService.findUserById(userInfo.user_id);

        if (!user) {
          throw new NotFoundException('User profile not found');
        }

        if (!user.isActive) {
          throw new UnauthorizedException('User account is deactivated');
        }

        const userObject: UserObject = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };

        return new ProfileResponseDto(
          userObject,
          user._id.toString(),
          user.createdAt,
          user.updatedAt,
          user.isActive,
        );
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error('Error fetching profile:', error);
      throw new NotFoundException('Failed to fetch profile');
    }
  }
}
