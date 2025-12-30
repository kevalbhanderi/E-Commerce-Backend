import { ApiProperty } from '@nestjs/swagger';
import { SubCategoryResponseDto } from './sub-category-response.dto';

export class SubCategoryListResponseDto {
  @ApiProperty({
    type: [SubCategoryResponseDto],
    description: 'List of subcategories',
  })
  readonly subCategories: SubCategoryResponseDto[];

  @ApiProperty({ description: 'Total number of subcategories' })
  readonly total: number;

  @ApiProperty({ description: 'Current page number' })
  readonly page: number;

  @ApiProperty({ description: 'Number of items per page' })
  readonly limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  readonly totalPages: number;

  constructor(
    subCategories: SubCategoryResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.subCategories = subCategories;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
