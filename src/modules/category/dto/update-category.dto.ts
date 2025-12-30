import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ title: 'Category name', required: false })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name?: string;

  @ApiProperty({ title: 'Category slug', required: false })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  slug?: string;

  @ApiProperty({ title: 'Category description', required: false })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({ title: 'Category active status', required: false })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}
