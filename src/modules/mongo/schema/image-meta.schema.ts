import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IImageMeta } from '../interface/image-meta.interface';

export type ImageMetaDocument = IImageMeta & Document;

@Schema({ _id: true, timestamps: false })
export class ImageMeta {
  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  size: number;

  @Prop({ default: false })
  isPrimary: boolean;

  @Prop({ default: Date.now })
  uploadedAt: Date;
}

export const ImageMetaSchema = SchemaFactory.createForClass(ImageMeta);
