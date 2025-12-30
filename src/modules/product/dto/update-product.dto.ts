import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ title: 'Product name', required: false })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name?: string;

  @ApiProperty({ title: 'Product slug', required: false })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  slug?: string;

  @ApiProperty({ title: 'Product description', required: false })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(5, { message: 'Description must be at least 5 characters long' })
  description?: string;

  @ApiProperty({ title: 'Product price', required: false, minimum: 0 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price?: number;

  @ApiProperty({ title: 'Product active status', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return Boolean(value);
  })
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}
