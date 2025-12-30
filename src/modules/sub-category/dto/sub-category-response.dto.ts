import { ApiProperty } from '@nestjs/swagger';

export class SubCategoryResponseDto {
  @ApiProperty({ description: 'SubCategory ID' })
  readonly subCategoryId: string;

  @ApiProperty({ description: 'SubCategory name' })
  readonly name: string;

  @ApiProperty({ description: 'SubCategory slug' })
  readonly slug: string;

  @ApiProperty({ description: 'Category ID' })
  readonly categoryId: string;

  @ApiProperty({ description: 'SubCategory active status' })
  readonly isActive: boolean;

  @ApiProperty({ description: 'SubCategory creation date' })
  readonly createdAt: Date;

  constructor(subCategory: {
    _id: string;
    name: string;
    slug: string;
    categoryId: string;
    isActive: boolean;
    createdAt: Date;
  }) {
    this.subCategoryId = subCategory._id;
    this.name = subCategory.name;
    this.slug = subCategory.slug;
    this.categoryId = subCategory.categoryId;
    this.isActive = subCategory.isActive;
    this.createdAt = subCategory.createdAt;
  }
}
