import { Document } from 'mongoose';

export interface ICategory extends Document {
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly isActive: boolean;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
