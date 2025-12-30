import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MongoService } from 'src/modules/mongo/mongo.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CategoryListResponseDto } from './dto/category-list-response.dto';
import type { JwtTokenInterface } from 'src/interface/jwt.token.interface';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly mongoService: MongoService) {}

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
   * Create category
   * @param createCategoryDto
   * @param userInfo
   * @returns
   */
  async createCategory(
    createCategoryDto: CreateCategoryDto,
    userInfo: JwtTokenInterface,
  ): Promise<CategoryResponseDto> {
    // Generate slug if not provided
    const slug = createCategoryDto.slug
      ? this.generateSlug(createCategoryDto.slug)
      : this.generateSlug(createCategoryDto.name);

    // Check if category with same slug already exists
    const existingCategory = await this.mongoService.findCategoryBySlug(slug);
    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    // Create category
    const category = await this.mongoService.createCategory({
      name: createCategoryDto.name,
      slug,
      description: createCategoryDto.description,
      createdBy: userInfo.user_id,
    });

    this.logger.log(`Category created successfully: ${category.name}`);

    return new CategoryResponseDto({
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive,
      createdBy: category.createdBy,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  }

  /**
   * Get all categories
   * @param page
   * @param limit
   * @param isActive
   * @returns
   */
  async getAllCategories(
    page: number = 1,
    limit: number = 10,
    isActive?: boolean,
  ): Promise<CategoryListResponseDto> {
    const result = await this.mongoService.findAllCategories(
      page,
      limit,
      isActive,
    );

    const categories = result.categories.map(
      (category) =>
        new CategoryResponseDto({
          _id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          description: category.description,
          isActive: category.isActive,
          createdBy: category.createdBy,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        }),
    );

    return new CategoryListResponseDto(
      categories,
      result.total,
      result.page,
      result.limit,
    );
  }

  /**
   * Get category by ID
   * @param categoryId
   * @returns
   */
  async getCategoryById(categoryId: string): Promise<CategoryResponseDto> {
    const category = await this.mongoService.findCategoryById(categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return new CategoryResponseDto({
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive,
      createdBy: category.createdBy,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  }

  /**
   * Update category
   * @param categoryId
   * @param updateCategoryDto
   * @returns
   */
  async updateCategory(
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    // Check if category exists
    const category = await this.mongoService.findCategoryById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Prepare update data
    const updateData: {
      name?: string;
      slug?: string;
      description?: string;
      isActive?: boolean;
    } = {};

    if (updateCategoryDto.name) {
      updateData.name = updateCategoryDto.name;
    }

    if (updateCategoryDto.slug) {
      updateData.slug = this.generateSlug(updateCategoryDto.slug);
      const existingCategory = await this.mongoService.findCategoryBySlug(
        updateData.slug,
      );
      if (existingCategory && existingCategory._id.toString() !== categoryId) {
        throw new ConflictException('Category with this slug already exists');
      }
    } else if (updateCategoryDto.name) {
      // If name changed but slug not provided, regenerate slug from name
      updateData.slug = this.generateSlug(updateCategoryDto.name);
      // Check if new slug conflicts
      const existingCategory = await this.mongoService.findCategoryBySlug(
        updateData.slug,
      );
      if (existingCategory && existingCategory._id.toString() !== categoryId) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    if (updateCategoryDto.description !== undefined) {
      updateData.description = updateCategoryDto.description;
    }

    if (updateCategoryDto.isActive !== undefined) {
      updateData.isActive = updateCategoryDto.isActive;
    }

    // Update category
    const updatedCategory = await this.mongoService.updateCategoryById(
      categoryId,
      updateData,
    );

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }

    this.logger.log(`Category updated successfully: ${updatedCategory.name}`);

    return new CategoryResponseDto({
      _id: updatedCategory._id.toString(),
      name: updatedCategory.name,
      slug: updatedCategory.slug,
      description: updatedCategory.description,
      isActive: updatedCategory.isActive,
      createdBy: updatedCategory.createdBy,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt,
    });
  }

  /**
   * Delete category
   * @param categoryId
   * @returns
   */
  async deleteCategory(categoryId: string): Promise<{ message: string }> {
    // Check if category exists
    const category = await this.mongoService.findCategoryById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has subcategories
    const subCategories =
      await this.mongoService.findSubCategoriesByCategoryId(categoryId);
    if (subCategories.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with existing subcategories. Please delete subcategories first.',
      );
    }

    // Delete category
    await this.mongoService.deleteCategoryById(categoryId);

    this.logger.log(`Category deleted successfully: ${category.name}`);

    return { message: 'Category deleted successfully' };
  }
}
