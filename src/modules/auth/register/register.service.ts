import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { generateMD5Hash } from '../../../utils/password.helper';
import { JwtHelper } from '../../../utils/jwt.helper';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { MongoService } from '../../../modules/mongo/mongo.service';
import { JwtTokenInterface } from '../../../interface/jwt.token.interface';
import { UserObject } from '../../../interface/user.object.interface';

@Injectable()
export class RegisterService {
  private readonly logger = new Logger(RegisterService.name);

  constructor(
    private readonly mongoService: MongoService,
    private readonly jwtHelper: JwtHelper,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    // Check user already exists or not
    const existingUser = await this.mongoService.findUserByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await generateMD5Hash(registerDto.password);

    // Build user Object
    const userData = {
      email: registerDto.email.toLowerCase(),
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    };

    // Save user
    const user = await this.mongoService.createUser(userData);

    try {
      // Calculate token expiration (24h is default time)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Generate JWT token with user_id
      const tokenPayload: JwtTokenInterface = {
        user_id: user._id.toString(),
        role: 'user',
      };
      // Calculate expiration in seconds to match session expiration
      const expiresInSeconds = Math.floor(
        (expiresAt.getTime() - new Date().getTime()) / 1000,
      );
      const token = this.jwtHelper.generateToken(
        tokenPayload,
        `${expiresInSeconds}s`,
      );

      // Create session token
      await this.mongoService.createSessionToken({
        token,
        user_id: user._id.toString(),
        email: user.email,
        role: 'user',
        expires_at: expiresAt,
      });

      this.logger.log(`User registered successfully: ${user.email}`);

      const userObject: UserObject = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      return new RegisterResponseDto(userObject, user._id.toString(), token);
    } catch (error) {
      // If token generation or session creation fails, rollback by deleting user
      this.logger.error(
        `Token generation failed for user ${user.email}, rolling back user creation`,
        error,
      );
      await this.mongoService.deleteUserById(user._id.toString());
      throw new BadRequestException(
        'Failed to generate authentication token. Please try again.',
      );
    }
  }
}
