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
    let account: {
      _id: string;
      email: string;
      password: string;
      role: 'user' | 'admin';
      isActive: boolean;
      firstName?: string;
      lastName?: string;
      name?: string;
    } | null = null;
    let isAdmin = false;

    if (user) {
      account = {
        _id: user._id.toString(),
        email: user.email,
        password: user.password,
        role: user.role,
        isActive: user.isActive,
        firstName: user.firstName,
        lastName: user.lastName,
      };
      isAdmin = false;
    } else {
      // Check if admin exists
      const admin = await this.mongoService.findAdminByEmail(loginDto.email);
      if (admin) {
        account = {
          _id: admin._id.toString(),
          email: admin.email,
          password: admin.password,
          role: admin.role,
          isActive: admin.isActive,
          name: admin.name,
        };
        isAdmin = true;
      }
    }

    if (!account) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is active
    if (!account.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Hash the provided password and compare with stored hash
    const isPasswordValid = await comparePassword(
      loginDto.password,
      account.password,
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
        user_id: account._id.toString(),
        role: account.role,
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
        user_id: isAdmin ? undefined : account._id.toString(),
        admin_id: isAdmin ? account._id.toString() : undefined,
        email: account.email,
        role: account.role,
        expires_at: expiresAt,
      });

      const logMessage = isAdmin ? 'Admin' : 'User';
      this.logger.log(`${logMessage} logged in successfully: ${account.email}`);

      const userObject: UserObject = {
        email: account.email,
        firstName: isAdmin ? account.name || '' : account.firstName || '',
        lastName: isAdmin ? '' : account.lastName || '',
        role: account.role,
      };

      return new LoginResponseDto(userObject, account._id.toString(), token);
    } catch (error) {
      this.logger.error('Error during login:', error);
      throw new BadRequestException('Failed to generate authentication token');
    }
  }
}
