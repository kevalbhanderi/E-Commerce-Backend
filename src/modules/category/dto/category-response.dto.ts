import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID' })
  readonly categoryId: string;

  @ApiProperty({ description: 'Category name' })
  readonly name: string;

  @ApiProperty({ description: 'Category slug' })
  readonly slug: string;

  @ApiProperty({ description: 'Category description', required: false })
  readonly description?: string;

  @ApiProperty({ description: 'Category active status' })
  readonly isActive: boolean;

  @ApiProperty({ description: 'User ID who created the category' })
  readonly createdBy: string;

  @ApiProperty({ description: 'Category creation date' })
  readonly createdAt: Date;

  @ApiProperty({ description: 'Category last update date' })
  readonly updatedAt: Date;

  constructor(category: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.categoryId = category._id;
    this.name = category.name;
    this.slug = category.slug;
    this.description = category.description;
    this.isActive = category.isActive;
    this.createdBy = category.createdBy;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
  }
}
