import { Document } from 'mongoose';

export interface IImageMeta extends Document {
  readonly fileName: string;
  readonly filePath: string;
  readonly size: number;
  readonly isPrimary: boolean;
  readonly uploadedAt: Date;
}
