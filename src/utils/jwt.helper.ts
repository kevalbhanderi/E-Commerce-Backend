import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { JwtTokenInterface } from '../interface/jwt.token.interface';
import { MongoService } from 'src/modules/mongo/mongo.service';

@Injectable()
export class JwtHelper {
  constructor(private readonly mongoService: MongoService) { }

  async generateToken(tokenDto: JwtTokenInterface): Promise<string> {
    const token = jwt.sign(tokenDto, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRED_TIME,
    });
    return token;
  }

  async verify(token: string): Promise<false | JwtTokenInterface> {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtTokenInterface;
      const userSession = await this.mongoService.findSessionTokenByEmail(token);
      if (!userSession) {
        return false;
      }
      return { user_id: payload.user_id };
    } catch (e) {
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
