import { Document } from 'mongoose';
import { IImageMeta } from './image-meta.interface';

export interface IProduct extends Document {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly price: number;
  readonly categoryId: string;
  readonly subCategoryId: string;
  readonly images: IImageMeta[];
  readonly isActive: boolean;
  readonly isDeleted: boolean;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
