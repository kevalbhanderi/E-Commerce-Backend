import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { MongoModule } from './modules/mongo/mongo.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { UsersModule } from './modules/users/users.module';
import { CategoryModule } from './modules/category/category.module';
import { SubCategoryModule } from './modules/sub-category/sub-category.module';
import { ProductModule } from './modules/product/product.module';
import { EncryptionService } from './utils/encryption.service';
import { DecryptionInterceptor } from './interceptors/decryption.interceptor';
import { EncryptionInterceptor } from './interceptors/encryption.interceptor';

@Module({
  imports: [
    DatabaseModule,
    MongoModule,
    AuthModule,
    ProfileModule,
    UsersModule,
    CategoryModule,
    SubCategoryModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [
    EncryptionService,
    {
      provide: APP_INTERCEPTOR,
      useClass: DecryptionInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: EncryptionInterceptor,
    },
  ],
})
export class AppModule {}
