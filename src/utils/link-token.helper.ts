import { createHmac } from 'crypto';

export interface LinkTokenPayload {
  productId: string;
  type: 'public' | 'private';
  expires: number;
}

export interface ParsedToken {
  productId: string;
  type: 'public' | 'private';
  expires: number;
  signature: string;
}

export class LinkTokenHelper {
  private readonly secretKey: string;

  constructor() {
    this.secretKey =
      process.env.LINK_TOKEN_SECRET ||
      process.env.JWT_SECRET || 'secret';
  }

  /**
   * Sign token payload and generate shareable token
   * @param payload
   * @returns
   */
  signToken(payload: LinkTokenPayload): string {
    const { productId, type, expires } = payload;

    // Create signature
    const data = `${productId}:${type}:${expires}`;
    const signature = createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex');

    // Combine payload and signature
    const token = `${productId}:${type}:${expires}:${signature}`;

    // Encode to base64url (URL-safe)
    return Buffer.from(token).toString('base64url');
  }

  /**
   * Verify and parse token
   * @param token
   * @returns
   */
  verifyToken(token: string): ParsedToken | null {
    try {
      // Decode from base64url
      const decoded = Buffer.from(token, 'base64url').toString('utf-8');
      const parts = decoded.split(':');

      if (parts.length !== 4) {
        return null;
      }

      const [productId, type, expiresStr, signature] = parts;

      // Validate type
      if (type !== 'public' && type !== 'private') {
        return null;
      }

      const expires = parseInt(expiresStr, 10);
      if (isNaN(expires)) {
        return null;
      }

      // Check expiration first (before signature verification for better error messages)
      const now = Math.floor(Date.now() / 1000);
      if (expires < now) {
        return null; // Token expired
      }

      // Verify signature
      const data = `${productId}:${type}:${expires}`;
      const expectedSignature = createHmac('sha256', this.secretKey)
        .update(data)
        .digest('hex');

      if (signature !== expectedSignature) {
        return null; // Invalid signature
      }

      return {
        productId,
        type,
        expires,
        signature,
      };
    } catch {
      return null;
    }
  }

  /**
   * Generate expiration timestamp
   * @param expiresInSeconds
   * @returns
   */
  generateExpiration(expiresInSeconds: number): number {
    return Math.floor(Date.now() / 1000) + expiresInSeconds;
  }
}
