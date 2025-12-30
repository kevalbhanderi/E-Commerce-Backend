import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { JwtTokenInterface } from '../interface/jwt.token.interface';
import { MongoService } from '../modules/mongo/mongo.service';

@Injectable()
export class JwtHelper {
  constructor(private readonly mongoService: MongoService) {}

  generateToken(tokenDto: JwtTokenInterface, expiresIn?: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    const tokenExpiresIn = expiresIn || process.env.JWT_EXPIRED_TIME || '24h';
    return jwt.sign(tokenDto, secret, {
      expiresIn: tokenExpiresIn,
    } as jwt.SignOptions);
  }

  async verify(token: string): Promise<false | JwtTokenInterface> {
    try {
      if (!token) {
        return false;
      }
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return false;
      }

      // Remove Bearer prefix if present
      if (token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
      }
      if (!token) {
        return false;
      }
      let payload: JwtTokenInterface;
      try {
        payload = jwt.verify(token, secret) as JwtTokenInterface;
      } catch {
        return false;
      }

      // Check if session token exists
      const userSession =
        await this.mongoService.findSessionTokenByEmail(token);
      if (!userSession) {
        return false;
      }

      // Check if session token is expired
      if (userSession.expires_at < new Date()) {
        return false;
      }

      return { user_id: payload.user_id, role: payload.role };
    } catch {
      return false;
    }
  }

  getTokenFromHeader(request: Request): string | undefined {
    // Try different header formats (case-insensitive)
    const token = request.headers['x-access-token'] as string;

    if (!token) {
      return undefined;
    }

    // Remove Bearer prefix if present
    if (token.startsWith('Bearer ')) {
      return token.slice(7).trim();
    }

    return token.trim();
  }
}
