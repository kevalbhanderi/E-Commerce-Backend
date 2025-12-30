import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Admin, AdminDocument } from './schema/admin.schema';
import {
  SessionToken,
  SessionTokenDocument,
} from './schema/session-token.schema';
import { Category, CategoryDocument } from './schema/category.schema';
import { SubCategory, SubCategoryDocument } from './schema/subcategory.schema';

@Injectable()
export class MongoService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    @InjectModel(SessionToken.name)
    private readonly sessionTokenModel: Model<SessionTokenDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategoryDocument>,
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

  /**
   * Get all users with pagination
   * @param page
   * @param limit
   * @returns
   */
  async findAllUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: UserDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      users,
      total,
      page,
      limit,
    };
  }

  /**
   * Create category
   * @param categoryData
   * @returns
   */
  async createCategory(categoryData: {
    name: string;
    slug: string;
    description?: string;
    createdBy: string;
  }): Promise<CategoryDocument> {
    const category = new this.categoryModel({
      ...categoryData,
      isActive: true,
    });
    return category.save();
  }

  /**
   * Find category by slug
   * @param slug
   * @returns
   */
  async findCategoryBySlug(slug: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findOne({ slug: slug.toLowerCase() }).exec();
  }

  /**
   * Find category by ID
   * @param categoryId
   * @returns
   */
  async findCategoryById(categoryId: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findById(categoryId).exec();
  }

  /**
   * Get all categories with pagination
   * @param page
   * @param limit
   * @param isActive
   * @returns
   */
  async findAllCategories(
    page: number = 1,
    limit: number = 10,
    isActive?: boolean,
  ): Promise<{
    categories: CategoryDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const query = isActive !== undefined ? { isActive } : {};

    const [categories, total] = await Promise.all([
      this.categoryModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.categoryModel.countDocuments(query).exec(),
    ]);

    return {
      categories,
      total,
      page,
      limit,
    };
  }

  /**
   * Update category by ID
   * @param categoryId
   * @param updateData
   * @returns
   */
  async updateCategoryById(
    categoryId: string,
    updateData: {
      name?: string;
      slug?: string;
      description?: string;
      image?: string;
      isActive?: boolean;
    },
  ): Promise<CategoryDocument | null> {
    return this.categoryModel
      .findByIdAndUpdate(categoryId, updateData, { new: true })
      .exec();
  }

  /**
   * Delete category by ID
   * @param categoryId
   * @returns
   */
  async deleteCategoryById(categoryId: string): Promise<void> {
    await this.categoryModel.findByIdAndDelete(categoryId).exec();
  }

  /**
   * Create subcategory
   * @param subCategoryData
   * @returns
   */
  async createSubCategory(subCategoryData: {
    name: string;
    slug: string;
    categoryId: string;
  }): Promise<SubCategoryDocument> {
    const subCategory = new this.subCategoryModel({
      ...subCategoryData,
      isActive: true,
    });
    return subCategory.save();
  }

  /**
   * Find subcategory by slug and categoryId
   * @param slug
   * @param categoryId
   * @returns
   */
  async findSubCategoryBySlugAndCategory(
    slug: string,
    categoryId: string,
  ): Promise<SubCategoryDocument | null> {
    return this.subCategoryModel
      .findOne({ slug: slug.toLowerCase(), categoryId })
      .exec();
  }

  /**
   * Find subcategory by ID
   * @param subCategoryId
   * @returns
   */
  async findSubCategoryById(
    subCategoryId: string,
  ): Promise<SubCategoryDocument | null> {
    return this.subCategoryModel.findById(subCategoryId).exec();
  }

  /**
   * Get all subcategories by categoryId
   * @param categoryId
   * @param isActive
   * @returns
   */
  async findSubCategoriesByCategoryId(
    categoryId: string,
    isActive?: boolean,
  ): Promise<SubCategoryDocument[]> {
    const query: { categoryId: string; isActive?: boolean } = { categoryId };
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    return this.subCategoryModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get all subcategories with pagination
   * @param page
   * @param limit
   * @param isActive
   * @param categoryId
   * @returns
   */
  async findAllSubCategories(
    page: number = 1,
    limit: number = 10,
    isActive?: boolean,
    categoryId?: string,
  ): Promise<{
    subCategories: SubCategoryDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const query: { isActive?: boolean; categoryId?: string } = {};
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const [subCategories, total] = await Promise.all([
      this.subCategoryModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.subCategoryModel.countDocuments(query).exec(),
    ]);

    return {
      subCategories,
      total,
      page,
      limit,
    };
  }

  /**
   * Update subcategory by ID
   * @param subCategoryId
   * @param updateData
   * @returns
   */
  async updateSubCategoryById(
    subCategoryId: string,
    updateData: {
      name?: string;
      slug?: string;
      isActive?: boolean;
    },
  ): Promise<SubCategoryDocument | null> {
    return this.subCategoryModel
      .findByIdAndUpdate(subCategoryId, updateData, { new: true })
      .exec();
  }

  /**
   * Delete subcategory by ID
   * @param subCategoryId
   * @returns
   */
  async deleteSubCategoryById(subCategoryId: string): Promise<void> {
    await this.subCategoryModel.findByIdAndDelete(subCategoryId).exec();
  }
}
