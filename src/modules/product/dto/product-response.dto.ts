import { ApiProperty } from '@nestjs/swagger';
import { ImageMetaResponseDto } from './image-meta-response.dto';

export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID' })
  readonly productId: string;

  @ApiProperty({ description: 'Product name' })
  readonly name: string;

  @ApiProperty({ description: 'Product slug' })
  readonly slug: string;

  @ApiProperty({ description: 'Product description' })
  readonly description: string;

  @ApiProperty({ description: 'Product price' })
  readonly price: number;

  @ApiProperty({ description: 'Category ID' })
  readonly categoryId: string;

  @ApiProperty({ description: 'SubCategory ID' })
  readonly subCategoryId: string;

  @ApiProperty({
    type: [ImageMetaResponseDto],
    description: 'Product images',
  })
  readonly images: ImageMetaResponseDto[];

  @ApiProperty({ description: 'Product active status' })
  readonly isActive: boolean;

  @ApiProperty({ description: 'Product deleted status' })
  readonly isDeleted: boolean;

  @ApiProperty({ description: 'User ID who created the product' })
  readonly createdBy: string;

  @ApiProperty({ description: 'Product creation date' })
  readonly createdAt: Date;

  @ApiProperty({ description: 'Product last update date' })
  readonly updatedAt: Date;

  constructor(product: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    categoryId: string;
    subCategoryId: string;
    images: Array<{
      _id: string;
      fileName: string;
      filePath: string;
      size: number;
      isPrimary: boolean;
      uploadedAt: Date;
    }>;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.productId = product._id;
    this.name = product.name;
    this.slug = product.slug;
    this.description = product.description;
    this.price = product.price;
    this.categoryId = product.categoryId;
    this.subCategoryId = product.subCategoryId;
    this.images = product.images.map(
      (img) =>
        new ImageMetaResponseDto({
          _id: img._id,
          fileName: img.fileName,
          filePath: img.filePath,
          size: img.size,
          isPrimary: img.isPrimary,
          uploadedAt: img.uploadedAt,
        }),
    );
    this.isActive = product.isActive;
    this.isDeleted = product.isDeleted;
    this.createdBy = product.createdBy;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}
