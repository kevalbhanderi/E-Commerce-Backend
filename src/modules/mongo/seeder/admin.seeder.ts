import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from '../schema/admin.schema';
import { generateMD5Hash } from 'src/utils/password.helper';

@Injectable()
export class AdminSeeder implements OnModuleInit {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  /**
   * Seed the Admin credentials at the intialization
   * @returns 
   */
  async seedAdmin(): Promise<void> {
    try {
      // Check if admin already exists
      const existingAdmin = await this.adminModel.findOne({
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com',
      });

      if (existingAdmin) {
        this.logger.log('Admin already exists. Skipping seed.');
        return;
      }

      // Default admin credentials from environment variables
      // Never hard-code the credentials. Just for the fallback, i have hardcoded the credentials.
      const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com';
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
      const defaultName = process.env.DEFAULT_ADMIN_NAME || 'Admin User';

      // Hash the password
      const hashedPassword = await generateMD5Hash(defaultPassword);

      // Create default admin
      const admin = new this.adminModel({
        email: defaultEmail,
        password: hashedPassword,
        name: defaultName,
        role: 'admin',
        permissions: ['all'],
        isActive: true,
      });

      await admin.save();

      this.logger.log('Default admin seeded successfully');
    } catch (error: unknown) {
      this.logger.error('Error seeding admin:', error);
      throw error;
    }
  }
}
