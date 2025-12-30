import * as crypto from 'crypto';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';

/**
 * Encrypted payload structure
 */
export interface EncryptedPayload {
  encrypted: string;
  iv: string;
  tag: string;
}

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly encryptionKey: Buffer;

  constructor() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      this.logger.warn(
        'ENCRYPTION_KEY not found in environment variables. Encryption will fail.',
      );
      this.encryptionKey = Buffer.alloc(this.keyLength);
    } else {
      // Convert string to buffer
      if (key.length === 64) {
        this.encryptionKey = Buffer.from(key, 'hex');
      } else if (key.length === 32) {
        this.encryptionKey = Buffer.from(key);
      } else {
        this.encryptionKey = crypto.createHash('sha256').update(key).digest();
      }
    }
  }

  /**
   * Check if encryption is enabled
   * @returns
   */
  isEncryptionEnabled(): boolean {
    return process.env.ENABLE_ENCRYPTION === 'true';
  }

  /**
   * Check if data is in encrypted format
   * @param data
   * @returns
   */
  isEncrypted(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }
    return (
      'encrypted' in data &&
      'iv' in data &&
      'tag' in data &&
      typeof data.encrypted === 'string' &&
      typeof data.iv === 'string' &&
      typeof data.tag === 'string'
    );
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param plaintext
   * @returns
   */
  encrypt(plaintext: string | object): EncryptedPayload {
    try {
      // Convert object to JSON string if needed
      const dataString =
        typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext);

      // Generate random IV
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
      );

      // Encrypt data
      let encrypted = cipher.update(dataString, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Get authentication tag
      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
      };
    } catch (error) {
      this.logger.error('Encryption failed', error);
      throw new BadRequestException('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param payload
   * @returns
   */
  decrypt(payload: EncryptedPayload): string {
    try {
      const iv = Buffer.from(payload.iv, 'base64');
      const tag = Buffer.from(payload.tag, 'base64');
      const encrypted = Buffer.from(payload.encrypted, 'base64');

      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
      );

      // Set authentication tag
      decipher.setAuthTag(tag);

      // Decrypt data
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new BadRequestException(
        'Failed to decrypt data. Invalid or corrupted data.',
      );
    }
  }

  /**
   * Decrypt and parse JSON data
   * @param payload
   * @returns
   */
  decryptAndParse<T = any>(payload: EncryptedPayload): T {
    const decrypted = this.decrypt(payload);
    try {
      return JSON.parse(decrypted) as T;
    } catch {
      // If parsing fails, return as string
      return decrypted as unknown as T;
    }
  }
}
