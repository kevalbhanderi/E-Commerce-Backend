import { ApiProperty } from '@nestjs/swagger';

export class ShareLinkResponseDto {
  @ApiProperty({ description: 'Shareable link URL' })
  readonly shareLink: string;

  @ApiProperty({ description: 'Link type' })
  readonly type: 'public' | 'private';

  @ApiProperty({ description: 'Expiration timestamp (Unix timestamp)' })
  readonly expiresAt: number;

  @ApiProperty({ description: 'Expiration date (ISO string)' })
  readonly expiresAtISO: string;

  constructor(
    shareLink: string,
    type: 'public' | 'private',
    expiresAt: number,
  ) {
    this.shareLink = shareLink;
    this.type = type;
    this.expiresAt = expiresAt;
    this.expiresAtISO = new Date(expiresAt * 1000).toISOString();
  }
}

