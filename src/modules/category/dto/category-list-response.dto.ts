import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from './category-response.dto';

export class CategoryListResponseDto {
  @ApiProperty({
    type: [CategoryResponseDto],
    description: 'List of categories',
  })
  readonly categories: CategoryResponseDto[];

  @ApiProperty({ description: 'Total number of categories' })
  readonly total: number;

  @ApiProperty({ description: 'Current page number' })
  readonly page: number;

  @ApiProperty({ description: 'Number of items per page' })
  readonly limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  readonly totalPages: number;

  constructor(
    categories: CategoryResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.categories = categories;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
