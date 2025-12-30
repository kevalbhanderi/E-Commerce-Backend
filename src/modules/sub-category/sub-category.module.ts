import { Module } from '@nestjs/common';
import { SubCategoryController } from './sub-category.controller';
import { SubCategoryService } from './sub-category.service';
import { MongoModule } from 'src/modules/mongo/mongo.module';

@Module({
  imports: [MongoModule],
  controllers: [SubCategoryController],
  providers: [SubCategoryService],
  exports: [SubCategoryService],
})
export class SubCategoryModule {}
