import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtHelper } from '../utils/jwt.helper';
import type { JwtTokenInterface } from '../interface/jwt.token.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtHelper: JwtHelper) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.jwtHelper.getTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        isError: true,
        message: 'Login required - Token not provided',
      });
    }

    const user = await this.jwtHelper.verify(token);
    if (!user) {
      throw new UnauthorizedException({
        isError: true,
        message: 'Login required - Invalid or expired token',
      });
    }

    // Attach user information to request for use in controllers and guards
    (request as { user?: JwtTokenInterface }).user = user;
    return true;
  }
}
