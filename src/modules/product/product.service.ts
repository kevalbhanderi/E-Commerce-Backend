import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MongoService } from 'src/modules/mongo/mongo.service';
import { FileUploadHelper } from 'src/utils/file-upload.helper';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductListResponseDto } from './dto/product-list-response.dto';
import type { JwtTokenInterface } from 'src/interface/jwt.token.interface';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly mongoService: MongoService,
    private readonly fileUploadHelper: FileUploadHelper,
  ) {}

  /**
   * Generate slug from name
   * @param name
   * @returns
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/(^-+|-+$|[^\w]+)+/g, '-');
  }

  /**
   * Create product with image upload
   * @param createProductDto
   * @param file
   * @param userInfo
   * @returns
   */
  async createProduct(
    createProductDto: CreateProductDto,
    file: Express.Multer.File | undefined,
    userInfo: JwtTokenInterface,
  ): Promise<ProductResponseDto> {
    // Verify category exists
    const category = await this.mongoService.findCategoryById(
      createProductDto.categoryId,
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Verify subcategory exists
    const subCategory = await this.mongoService.findSubCategoryById(
      createProductDto.subCategoryId,
    );
    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }

    // Verify subcategory belongs to category
    if (subCategory.categoryId !== createProductDto.categoryId) {
      throw new ConflictException(
        'SubCategory does not belong to the specified category',
      );
    }

    const slug = createProductDto.slug
      ? this.generateSlug(createProductDto.slug)
      : this.generateSlug(createProductDto.name);

    // Check if product with same slug already exists
    const existingProduct = await this.mongoService.findProductBySlug(slug);
    if (existingProduct) {
      throw new ConflictException('Product with this slug already exists');
    }

    let imageMetadata: any = null;
    if (file) {
      imageMetadata = await this.fileUploadHelper.uploadFile(file, true);
    }

    // Create product
    const product = await this.mongoService.createProduct({
      name: createProductDto.name,
      slug,
      description: createProductDto.description,
      price: createProductDto.price,
      categoryId: createProductDto.categoryId,
      subCategoryId: createProductDto.subCategoryId,
      createdBy: userInfo.user_id,
    });

    // Update product with image
    if (imageMetadata) {
      (product as any).images = [imageMetadata];
      await product.save();
    }

    this.logger.log(`Product created successfully: ${product.name}`);

    return this.mapToProductResponseDto(product);
  }

  /**
   * Get all products
   * @param page
   * @param limit
   * @param isActive
   * @param categoryId
   * @param subCategoryId
   * @returns
   */
  async getAllProducts(
    page: number = 1,
    limit: number = 10,
    isActive?: boolean,
    categoryId?: string,
    subCategoryId?: string,
  ): Promise<ProductListResponseDto> {
    const result = await this.mongoService.findAllProducts(
      page,
      limit,
      isActive,
      categoryId,
      subCategoryId,
    );

    const products = result.products.map((product) =>
      this.mapToProductResponseDto(product),
    );

    return new ProductListResponseDto(
      products,
      result.total,
      result.page,
      result.limit,
    );
  }

  /**
   * Get product by ID
   * @param productId
   * @returns
   */
  async getProductById(productId: string): Promise<ProductResponseDto> {
    const product = await this.mongoService.findProductById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapToProductResponseDto(product);
  }

  /**
   * Update product and image
   * @param productId
   * @param updateProductDto
   * @param file
   * @returns
   */
  async updateProduct(
    productId: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    // Check if product exists
    const product = await this.mongoService.findProductById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Prepare update data
    const updateData: {
      name?: string;
      slug?: string;
      description?: string;
      price?: number;
      isActive?: boolean;
      images?: any[];
    } = {};

    if (updateProductDto.name) {
      updateData.name = updateProductDto.name;
    }

    if (updateProductDto.slug) {
      updateData.slug = this.generateSlug(updateProductDto.slug);
      // Check if new slug conflicts with existing product
      const existingProduct = await this.mongoService.findProductBySlug(
        updateData.slug,
      );
      if (existingProduct && existingProduct._id.toString() !== productId) {
        throw new ConflictException('Product with this slug already exists');
      }
    } else if (updateProductDto.name) {
      // If name changed but slug not provided, regenerate slug from name
      updateData.slug = this.generateSlug(updateProductDto.name);
      // Check if new slug conflicts
      const existingProduct = await this.mongoService.findProductBySlug(
        updateData.slug,
      );
      if (existingProduct && existingProduct._id.toString() !== productId) {
        throw new ConflictException('Product with this slug already exists');
      }
    }

    if (updateProductDto.description !== undefined) {
      updateData.description = updateProductDto.description;
    }

    if (updateProductDto.price !== undefined) {
      updateData.price = updateProductDto.price;
    }

    if (updateProductDto.isActive !== undefined) {
      updateData.isActive = updateProductDto.isActive;
    }

    // Handle image upload
    if (file) {
      // Delete old image if exists
      if (product.images && product.images.length > 0) {
        const oldImage = product.images[0];
        try {
          await this.fileUploadHelper.deleteFile(oldImage.filePath);
        } catch (error) {
          this.logger.warn(`Error deleting old image: ${error.message}`);
        }
      }
      // Upload new image
      const newImage = await this.fileUploadHelper.uploadFile(file, true);
      updateData.images = [newImage];
    }

    // Update product
    const updatedProduct = await this.mongoService.updateProductById(
      productId,
      updateData,
    );

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    this.logger.log(`Product updated successfully: ${updatedProduct.name}`);

    return this.mapToProductResponseDto(updatedProduct);
  }

  /**
   * Delete product (soft delete)
   * @param productId
   * @returns
   */
  async deleteProduct(productId: string): Promise<{ message: string }> {
    // Check if product exists
    const product = await this.mongoService.findProductById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Delete associated image from filesystem
    if (product.images && product.images.length > 0) {
      const image = product.images[0];
      try {
        await this.fileUploadHelper.deleteFile(image.filePath);
      } catch (error) {
        this.logger.warn(`Error deleting product image: ${error.message}`);
      }
    }

    // Soft delete product
    await this.mongoService.deleteProductById(productId);

    this.logger.log(`Product deleted successfully: ${product.name}`);

    return { message: 'Product deleted successfully' };
  }

  /**
   * Map product data to response DTO
   * @param product
   * @returns
   */
  private mapToProductResponseDto(product: any): ProductResponseDto {
    return new ProductResponseDto({
      _id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      images: product.images.map((img: any) => ({
        _id: img._id ? img._id.toString() : '',
        fileName: img.fileName,
        filePath: img.filePath,
        size: img.size,
        isPrimary: img.isPrimary,
        uploadedAt: img.uploadedAt,
      })),
      isActive: product.isActive,
      isDeleted: product.isDeleted,
      createdBy: product.createdBy,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }
}
