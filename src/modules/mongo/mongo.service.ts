import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import {
  SessionToken,
  SessionTokenDocument,
} from './schema/session-token.schema';

@Injectable()
export class MongoService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(SessionToken.name)
    private readonly sessionTokenModel: Model<SessionTokenDocument>,
  ) {}

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  /**
   * Build and save user in DB
   * @param userData
   * @returns
   */
  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<UserDocument> {
    const user = new this.userModel({
      ...userData,
      email: userData.email.toLowerCase(),
      role: 'user',
      isActive: true,
    });
    return user.save();
  }

  /**
   * Find session token
   * @param token
   * @returns
   */
  async findSessionTokenByEmail(
    token: string,
  ): Promise<SessionTokenDocument | null> {
    return this.sessionTokenModel.findOne({ token, is_active: true }).exec();
  }

  /**
   * Create session Token
   * @param sessionData
   * @returns
   */
  async createSessionToken(sessionData: {
    token: string;
    user_id?: string;
    admin_id?: string;
    email: string;
    role: 'user' | 'admin';
    ip_address?: string;
    user_agent?: string;
    expires_at: Date;
  }): Promise<SessionTokenDocument> {
    const sessionToken = new this.sessionTokenModel({
      ...sessionData,
      is_active: true,
    });
    return sessionToken.save();
  }

  async deleteUserById(userId: string): Promise<void> {
    await this.userModel.findByIdAndDelete(userId).exec();
  }
}
