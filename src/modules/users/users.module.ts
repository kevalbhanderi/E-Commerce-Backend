import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongoModule } from 'src/modules/mongo/mongo.module';
import { JwtHelper } from 'src/utils/jwt.helper';

@Module({
  imports: [MongoModule],
  controllers: [UsersController],
  providers: [UsersService, JwtHelper],
  exports: [UsersService],
})
export class UsersModule {}
