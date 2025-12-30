import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ISubCategory } from '../interface/subcategory.interface';

export type SubCategoryDocument = ISubCategory & Document;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'subcategories',
})
export class SubCategory {
  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ required: true, type: String, ref: 'Category', index: true })
  categoryId: string;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);

// Indexing
SubCategorySchema.index({ categoryId: 1 });
SubCategorySchema.index({ slug: 1, categoryId: 1 }, { unique: true });
SubCategorySchema.index({ isActive: 1 });
SubCategorySchema.index({ categoryId: 1, isActive: 1 });
