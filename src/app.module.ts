import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { MongoModule } from './modules/mongo/mongo.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [DatabaseModule, MongoModule, AuthModule, ProfileModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
