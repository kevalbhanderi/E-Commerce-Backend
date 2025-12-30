import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSubCategoryDto {
  @ApiProperty({ title: 'SubCategory name' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @ApiProperty({
    title: 'SubCategory slug',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  slug?: string;

  @ApiProperty({ title: 'Category ID' })
  @IsString({ message: 'Category ID must be a string' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;
}
