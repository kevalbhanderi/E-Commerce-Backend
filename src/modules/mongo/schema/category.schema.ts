import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ICategory } from '../interface/category.interface';

export type CategoryDocument = ICategory & Document;

@Schema({ timestamps: true, collection: 'categories' })
export class Category {
  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  slug: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ required: true, type: String, ref: 'User', index: true })
  createdBy: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexing
CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ createdBy: 1 });
CategorySchema.index({ name: 1, isActive: 1 });
