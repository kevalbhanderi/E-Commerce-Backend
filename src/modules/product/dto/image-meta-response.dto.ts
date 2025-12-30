import { ApiProperty } from '@nestjs/swagger';

export class ImageMetaResponseDto {
  @ApiProperty({ description: 'Image ID' })
  readonly _id: string;

  @ApiProperty({ description: 'File name' })
  readonly fileName: string;

  @ApiProperty({ description: 'File path' })
  readonly filePath: string;

  @ApiProperty({ description: 'File size in bytes' })
  readonly size: number;

  @ApiProperty({ description: 'Is primary image' })
  readonly isPrimary: boolean;

  @ApiProperty({ description: 'Upload date' })
  readonly uploadedAt: Date;

  constructor(imageMeta: {
    _id: string;
    fileName: string;
    filePath: string;
    size: number;
    isPrimary: boolean;
    uploadedAt: Date;
  }) {
    this._id = imageMeta._id;
    this.fileName = imageMeta.fileName;
    this.filePath = imageMeta.filePath;
    this.size = imageMeta.size;
    this.isPrimary = imageMeta.isPrimary;
    this.uploadedAt = imageMeta.uploadedAt;
  }
}
