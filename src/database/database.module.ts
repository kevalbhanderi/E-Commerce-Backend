import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forRoot(`mongodb://${process.env.MONGO_URL}`, {
            auth: { username: process.env.MONGO_USER, password: process.env.MONGO_PASS },
            dbName: process.env.MONGO_DB,
            authSource: process.env.MONGO_AUTH_DB,
        }),
    ]
})
export class DatabaseModule { }
