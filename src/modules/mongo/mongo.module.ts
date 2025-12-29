import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoController } from './mongo.controller';
import { MongoService } from './mongo.service';
import { User, UserSchema } from './schema/user.schema';
import { Admin, AdminSchema } from './schema/admin.schema';
import { SessionToken, SessionTokenSchema } from './schema/session-token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: SessionToken.name, schema: SessionTokenSchema },
    ]),
  ],
  controllers: [MongoController],
  providers: [MongoService],
  exports: [MongoService, MongooseModule],
})
export class MongoModule {}
