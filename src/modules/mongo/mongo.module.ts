import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoController } from './mongo.controller';
import { MongoService } from './mongo.service';
import { User, UserSchema } from './schema/user.schema';
import { Admin, AdminSchema } from './schema/admin.schema';
import { SessionToken, SessionTokenSchema } from './schema/session-token.schema';
import { AdminSeeder } from './seeder/admin.seeder';
import { JwtHelper } from 'src/utils/jwt.helper';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: SessionToken.name, schema: SessionTokenSchema },
    ]),
  ],
  controllers: [MongoController],
  providers: [MongoService, AdminSeeder, JwtHelper],
  exports: [MongoService, MongooseModule, JwtHelper],
})
export class MongoModule {}
