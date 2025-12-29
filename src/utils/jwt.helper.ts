import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { JwtTokenInterface } from '../interface/jwt.token.interface';
import { MongoService } from 'src/modules/mongo/mongo.service';

@Injectable()
export class JwtHelper {
  constructor(private readonly mongoService: MongoService) {}

  generateToken(tokenDto: JwtTokenInterface): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    const expiresIn = process.env.JWT_EXPIRED_TIME || '24h';
    const token = jwt.sign(tokenDto, secret, { expiresIn } as jwt.SignOptions);
    return token;
  }

  async verify(token: string): Promise<false | JwtTokenInterface> {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return false;
      }
      const payload = jwt.verify(token, secret) as JwtTokenInterface;
      const userSession =
        await this.mongoService.findSessionTokenByEmail(token);
      if (!userSession) {
        return false;
      }
      return { user_id: payload.user_id, role: payload.role };
    } catch {
      return false;
    }
  }

  getTokenFromHeader(request: Request): string {
    let token = request.headers['x-access-token'] as string;

    if (token && token.startsWith('Bearer ')) {
      // Remove Bearer from string
      return (token = token.slice(7, token.length));
    }
    return token;
  }
}
