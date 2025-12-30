import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ title: 'Category name', example: 'Electronics' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @ApiProperty({
    title: 'Category slug',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  slug?: string;

  @ApiProperty({
    title: 'Category description',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
