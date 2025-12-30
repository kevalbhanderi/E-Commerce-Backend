import { Injectable, Logger } from '@nestjs/common';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { randomBytes } from 'crypto';

export interface FileMetadata {
  fileName: string;
  filePath: string;
  size: number;
  isPrimary: boolean;
  uploadedAt: Date;
}

@Injectable()
export class FileUploadHelper {
  private readonly logger = new Logger(FileUploadHelper.name);
  private readonly publicPath = join(process.cwd(), 'src', 'public');
  private readonly productsPath = join(this.publicPath, 'products');

  constructor() {
    this.logger.log(`Public path: ${this.publicPath}`);
    this.logger.log(`Products path: ${this.productsPath}`);
    void this.ensureDirectoriesExist();
  }

  /**
   * Ensure required directories exist
   */
  private async ensureDirectoriesExist(): Promise<void> {
    try {
      if (!existsSync(this.publicPath)) {
        await mkdir(this.publicPath, { recursive: true });
      }
      if (!existsSync(this.productsPath)) {
        await mkdir(this.productsPath, { recursive: true });
      }
    } catch (error) {
      this.logger.error('Error creating directories', error);
    }
  }

  /**
   * Validate file type
   * @param mimetype
   * @returns
   */
  private isValidImageType(mimetype: string): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(mimetype);
  }

  /**
   * Generate unique filename
   * @param originalname
   * @returns
   */
  private generateFileName(originalname: string): string {
    const ext = originalname.split('.').pop();
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    return `${timestamp}-${randomString}.${ext}`;
  }

  /**
   * Upload single file
   * @param file
   * @param isPrimary
   * @returns
   */
  async uploadFile(
    file: Express.Multer.File,
    isPrimary: boolean = false,
  ): Promise<FileMetadata> {
    // Validate file type
    if (!this.isValidImageType(file.mimetype)) {
      throw new Error(
        'Invalid file type. Only JPEG, JPG, PNG, and WEBP are allowed.',
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }

    // Generate unique filename
    const fileName = this.generateFileName(file.originalname);
    const filePath = join(this.productsPath, fileName);
    const relativePath = `products/${fileName}`;

    // Ensure directory exists
    await this.ensureDirectoriesExist();

    // Verify directory exists before writing
    if (!existsSync(this.productsPath)) {
      throw new Error(
        `Products directory does not exist: ${this.productsPath}`,
      );
    }

    // Write file to disk
    this.logger.log(`Writing file to: ${filePath}`);
    try {
      await writeFile(filePath, file.buffer);
      if (!existsSync(filePath)) {
        throw new Error(`File was not written to: ${filePath}`);
      }
      this.logger.log(
        `File uploaded successfully: ${relativePath} (Full path: ${filePath})`,
      );
    } catch (error) {
      this.logger.error(`Error writing file to ${filePath}:`, error);
      throw error;
    }

    return {
      fileName,
      filePath: relativePath,
      size: file.size,
      isPrimary,
      uploadedAt: new Date(),
    };
  }

  /**
   * Delete file
   * @param filePath
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = join(this.publicPath, filePath);
    try {
      if (existsSync(fullPath)) {
        await unlink(fullPath);
        this.logger.log(`File deleted successfully: ${filePath}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting file: ${filePath}`, error);
      throw error;
    }
  }
}
