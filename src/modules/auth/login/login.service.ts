import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { comparePassword } from 'src/utils/password.helper';
import { JwtHelper } from 'src/utils/jwt.helper';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { MongoService } from 'src/modules/mongo/mongo.service';
import { JwtTokenInterface } from 'src/interface/jwt.token.interface';
import { UserObject } from 'src/interface/user.object.interface';

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);

  constructor(
    private readonly mongoService: MongoService,
    private readonly jwtHelper: JwtHelper,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // Check if user exists
    const user = await this.mongoService.findUserByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // Hash the provided password and compare with stored hash
    const isPasswordValid = await comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    try {
      // Calculate token expiration (24h is default time)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Generate JWT token with role
      const tokenPayload: JwtTokenInterface = {
        user_id: user._id.toString(),
        role: user.role,
      };
      // Calculate expiration in seconds to match session expiration
      const expiresInSeconds = Math.floor(
        (expiresAt.getTime() - new Date().getTime()) / 1000,
      );
      const token = this.jwtHelper.generateToken(
        tokenPayload,
        `${expiresInSeconds}s`,
      );

      // Replace existing session token or create new one
      await this.mongoService.replaceOrCreateSessionToken({
        token,
        user_id: user._id.toString(),
        email: user.email,
        role: user.role,
        expires_at: expiresAt,
      });

      this.logger.log(`User logged in successfully: ${user.email}`);

      const userObject: UserObject = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      return new LoginResponseDto(userObject, user._id.toString(), token);
    } catch (error) {
      this.logger.error('Error during login:', error);
      throw new BadRequestException('Failed to generate authentication token');
    }
  }
}
