import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Admin, AdminDocument } from './schema/admin.schema';
import {
  SessionToken,
  SessionTokenDocument,
} from './schema/session-token.schema';

@Injectable()
export class MongoService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    @InjectModel(SessionToken.name)
    private readonly sessionTokenModel: Model<SessionTokenDocument>,
  ) {}

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  /**
   * Find admin by email
   * @param email
   * @returns
   */
  async findAdminByEmail(email: string): Promise<AdminDocument | null> {
    return this.adminModel.findOne({ email: email.toLowerCase() }).exec();
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
    role: 'user' | 'admin' | 'manager';
    ip_address?: string;
    user_agent?: string;
    expires_at: Date;
  }): Promise<SessionTokenDocument> {
    const sessionToken = new this.sessionTokenModel({
      ...sessionData,
      is_active: true,
    });
    const saved = await sessionToken.save();
    return saved;
  }

  async deleteUserById(userId: string): Promise<void> {
    await this.userModel.findByIdAndDelete(userId).exec();
  }

  /**
   * Find active session token by user_id
   * @param user_id
   * @returns
   */
  async findSessionTokenByUserId(
    user_id: string,
  ): Promise<SessionTokenDocument | null> {
    return this.sessionTokenModel.findOne({ user_id, is_active: true }).exec();
  }

  /**
   * Deactivate existing session token
   * @param user_id
   */
  async deactivateSessionTokenByUserId(user_id: string): Promise<void> {
    await this.sessionTokenModel
      .updateMany({ user_id, is_active: true }, { is_active: false })
      .exec();
  }

  /**
   * Deactivate existing session token by admin_id
   * @param admin_id
   */
  async deactivateSessionTokenByAdminId(admin_id: string): Promise<void> {
    await this.sessionTokenModel
      .updateMany({ admin_id, is_active: true }, { is_active: false })
      .exec();
  }

  /**
   * Replace session token
   * @param sessionData
   * @returns
   */
  async replaceOrCreateSessionToken(sessionData: {
    token: string;
    user_id?: string;
    admin_id?: string;
    email: string;
    role: 'user' | 'admin' | 'manager';
    ip_address?: string;
    user_agent?: string;
    expires_at: Date;
  }): Promise<SessionTokenDocument> {
    if (sessionData.user_id) {
      await this.deactivateSessionTokenByUserId(sessionData.user_id);
    }
    if (sessionData.admin_id) {
      await this.deactivateSessionTokenByAdminId(sessionData.admin_id);
    }
    return this.createSessionToken(sessionData);
  }

  /**
   * Get user Details
   * @param userId
   * @returns
   */
  async findUserById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  /**
   * Get admin Details
   * @param adminId
   * @returns
   */
  async findAdminById(adminId: string): Promise<AdminDocument | null> {
    return this.adminModel.findById(adminId).exec();
  }

  /**
   * Update user by ID
   * @param userId
   * @param updateData
   * @returns
   */
  async updateUserById(
    userId: string,
    updateData: {
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: 'user' | 'manager';
    },
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();
  }
}
