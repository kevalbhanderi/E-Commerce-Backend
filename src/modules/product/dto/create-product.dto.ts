import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ title: 'Product name', type: String })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @ApiProperty({ title: 'Product slug', required: false, type: String })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  slug?: string;

  @ApiProperty({ title: 'Product description', type: String })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(5, {
    message: 'Description must be at least 5 characters long',
  })
  description: string;

  @ApiProperty({ title: 'Product price', minimum: 0, type: Number })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber({}, { message: 'Price must be a number' })
  @IsNotEmpty({ message: 'Price is required' })
  price: number;

  @ApiProperty({ title: 'Category ID', type: String })
  @IsString({ message: 'Category ID must be a string' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @ApiProperty({ title: 'SubCategory ID', type: String })
  @IsString({ message: 'SubCategory ID must be a string' })
  @IsNotEmpty({ message: 'SubCategory ID is required' })
  subCategoryId: string;
}
