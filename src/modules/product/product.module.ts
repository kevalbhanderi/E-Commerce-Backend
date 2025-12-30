import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MongoModule } from 'src/modules/mongo/mongo.module';
import { FileUploadHelper } from 'src/utils/file-upload.helper';

@Module({
  imports: [MongoModule],
  controllers: [ProductController],
  providers: [ProductService, FileUploadHelper],
  exports: [ProductService],
})
export class ProductModule {}
