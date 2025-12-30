import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IProduct } from '../interface/product.interface';
import { ImageMeta, ImageMetaSchema } from './image-meta.schema';

export type ProductDocument = IProduct & Document;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
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

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, type: String, ref: 'Category', index: true })
  categoryId: string;

  @Prop({ required: true, type: String, ref: 'SubCategory', index: true })
  subCategoryId: string;

  @Prop({ type: [ImageMetaSchema], default: [] })
  images: ImageMeta[];

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ required: true, type: String, ref: 'User', index: true })
  createdBy: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexing
ProductSchema.index({ slug: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ subCategoryId: 1 });
ProductSchema.index({ isActive: 1, isDeleted: 1 });
ProductSchema.index({ categoryId: 1, subCategoryId: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
