import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { MongoModule } from 'src/modules/mongo/mongo.module';
import { JwtHelper } from 'src/utils/jwt.helper';

@Module({
  imports: [MongoModule],
  controllers: [ProfileController],
  providers: [ProfileService, JwtHelper],
  exports: [ProfileService],
})
export class ProfileModule {}
