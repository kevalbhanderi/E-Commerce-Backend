import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtHelper } from '../utils/jwt.helper';
import type { JwtTokenInterface } from '../interface/jwt.token.interface';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtHelper: JwtHelper) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.jwtHelper.getTokenFromHeader(request);

    // If token exists, verify it and attach user
    if (token) {
      const user = await this.jwtHelper.verify(token);
      if (user) {
        (request as { user?: JwtTokenInterface }).user = user;
      }
    }

    // Always allow the request to proceed
    return true;
  }
}

