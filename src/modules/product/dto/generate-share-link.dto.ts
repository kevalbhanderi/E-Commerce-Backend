import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export enum ShareLinkType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export class GenerateShareLinkDto {
  @ApiProperty({
    title: 'Link type',
    enum: ShareLinkType,
    example: 'public',
  })
  @IsEnum(ShareLinkType, { message: 'Type must be either public or private' })
  type: 'public' | 'private';

  @ApiProperty({
    title: 'Expiration time in seconds',
    required: false,
    description: 'Default: 2592000 (30 days) for public, 604800 (7 days) for private',
    minimum: 60,
  })
  @IsOptional()
  @IsNumber({}, { message: 'expiresIn must be a number' })
  @Min(60, { message: 'expiresIn must be at least 60 seconds' })
  expiresIn?: number;
}

