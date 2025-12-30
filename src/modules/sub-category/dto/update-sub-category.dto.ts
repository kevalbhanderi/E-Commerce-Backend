import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateSubCategoryDto {
  @ApiProperty({ title: 'SubCategory name', required: false })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name?: string;

  @ApiProperty({ title: 'SubCategory slug', required: false })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  slug?: string;

  @ApiProperty({ title: 'SubCategory active status', required: false })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}
