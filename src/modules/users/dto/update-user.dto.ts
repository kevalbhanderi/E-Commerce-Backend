import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ title: 'User email', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({ title: 'First name', required: false })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name cannot be empty' })
  firstName?: string;

  @ApiProperty({ title: 'Last name', required: false })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(1, { message: 'Last name cannot be empty' })
  lastName?: string;

  @ApiProperty({
    title: 'User role',
    enum: ['user', 'manager'],
    required: false,
    description: 'Only admin can update role',
  })
  @IsOptional()
  @IsEnum(['user', 'manager'], {
    message: 'Role must be either user or manager',
  })
  role?: 'user' | 'manager';
}
