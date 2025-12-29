import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MongoService } from 'src/modules/mongo/mongo.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';
import { JwtTokenInterface } from 'src/interface/jwt.token.interface';
import { UserObject } from 'src/interface/user.object.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly mongoService: MongoService) {}

  /**
   * Update User
   * @param userInfo 
   * @param userId 
   * @param updateDto 
   * @returns 
   */
  async updateUser(
    userInfo: JwtTokenInterface,
    userId: string,
    updateDto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    // Check if user exists
    const user = await this.mongoService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // Validate permissions
    if (userInfo.role === 'admin') {
      // Admin can only update role
      if (updateDto.email || updateDto.firstName || updateDto.lastName) {
        throw new ForbiddenException(
          'Admin can only update user role, not personal information',
        );
      }
      if (!updateDto.role) {
        throw new ForbiddenException('Admin must provide role to update');
      }
    } else {
      // User can update their own profile (email, firstName, lastName)
      if (userInfo.user_id !== userId) {
        throw new ForbiddenException('You can only update your own profile');
      }
      if (updateDto.role) {
        throw new ForbiddenException('You cannot update your own role');
      }
      if (!updateDto.email && !updateDto.firstName && !updateDto.lastName) {
        throw new ForbiddenException(
          'You must provide at least one field to update (email, firstName, or lastName)',
        );
      }
    }

    // Prepare update data
    const updateData: {
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: 'user' | 'manager';
    } = {};

    if (updateDto.email) {
      // Check if email already exists (if changing email)
      if (updateDto.email.toLowerCase() !== user.email.toLowerCase()) {
        const existingUser = await this.mongoService.findUserByEmail(
          updateDto.email,
        );
        if (existingUser) {
          throw new ForbiddenException('Email already exists');
        }
      }
      updateData.email = updateDto.email.toLowerCase();
    }

    if (updateDto.firstName) {
      updateData.firstName = updateDto.firstName;
    }

    if (updateDto.lastName) {
      updateData.lastName = updateDto.lastName;
    }

    if (updateDto.role) {
      updateData.role = updateDto.role;
    }

    // Update user
    const updatedUser = await this.mongoService.updateUserById(
      userId,
      updateData,
    );
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    this.logger.log(`User updated successfully: ${updatedUser.email}`);

    const userObject: UserObject = {
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
    };

    return new UpdateUserResponseDto(
      userObject,
      updatedUser._id.toString(),
      updatedUser.createdAt,
      updatedUser.updatedAt,
      updatedUser.isActive,
    );
  }

  /**
   * Delete User
   * @param userInfo 
   * @param userId 
   * @returns 
   */
  async deleteUser(
    userInfo: JwtTokenInterface,
    userId: string,
  ): Promise<{ message: string }> {
    // Only admin can delete users
    if (userInfo.role !== 'admin') {
      throw new ForbiddenException('Only admin can delete users');
    }

    // Check if user exists
    const user = await this.mongoService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete user
    await this.mongoService.deleteUserById(userId);

    this.logger.log(`User deleted successfully: ${user.email}`);

    return { message: 'User deleted successfully' };
  }
}
