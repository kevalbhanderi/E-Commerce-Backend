import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoController } from './mongo.controller';
import { MongoService } from './mongo.service';
import { User, UserSchema } from './schema/user.schema';
import { Admin, AdminSchema } from './schema/admin.schema';
import {
  SessionToken,
  SessionTokenSchema,
} from './schema/session-token.schema';
import { Category, CategorySchema } from './schema/category.schema';
import { SubCategory, SubCategorySchema } from './schema/subcategory.schema';
import { AdminSeeder } from './seeder/admin.seeder';
import { JwtHelper } from 'src/utils/jwt.helper';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: SessionToken.name, schema: SessionTokenSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubCategorySchema },
    ]),
  ],
  controllers: [MongoController],
  providers: [MongoService, AdminSeeder, JwtHelper],
  exports: [MongoService, MongooseModule, JwtHelper],
})
export class MongoModule {}
