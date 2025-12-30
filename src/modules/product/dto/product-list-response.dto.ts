import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

export class ProductListResponseDto {
  @ApiProperty({
    type: [ProductResponseDto],
    description: 'List of products',
  })
  readonly products: ProductResponseDto[];

  @ApiProperty({ description: 'Total number of products' })
  readonly total: number;

  @ApiProperty({ description: 'Current page number' })
  readonly page: number;

  @ApiProperty({ description: 'Number of items per page' })
  readonly limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  readonly totalPages: number;

  constructor(
    products: ProductResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.products = products;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
