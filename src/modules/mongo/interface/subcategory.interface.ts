import { Document } from 'mongoose';

export interface ISubCategory extends Document {
  readonly name: string;
  readonly slug: string;
  readonly categoryId: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
}
