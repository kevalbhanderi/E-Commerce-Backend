import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MongoService } from 'src/modules/mongo/mongo.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategoryResponseDto } from './dto/sub-category-response.dto';
import { SubCategoryListResponseDto } from './dto/sub-category-list-response.dto';

@Injectable()
export class SubCategoryService {
  private readonly logger = new Logger(SubCategoryService.name);

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
   * Create subcategory
   * @param createSubCategoryDto
   * @returns
   */
  async createSubCategory(
    createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategoryResponseDto> {
    // Verify category exists
    const category = await this.mongoService.findCategoryById(
      createSubCategoryDto.categoryId,
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Generate slug if not provided
    const slug = createSubCategoryDto.slug
      ? this.generateSlug(createSubCategoryDto.slug)
      : this.generateSlug(createSubCategoryDto.name);

    // Check if subcategory with same slug and categoryId already exists
    const existingSubCategory =
      await this.mongoService.findSubCategoryBySlugAndCategory(
        slug,
        createSubCategoryDto.categoryId,
      );
    if (existingSubCategory) {
      throw new ConflictException(
        'SubCategory with this slug already exists in this category',
      );
    }

    // Create subcategory
    const subCategory = await this.mongoService.createSubCategory({
      name: createSubCategoryDto.name,
      slug,
      categoryId: createSubCategoryDto.categoryId,
    });

    this.logger.log(`SubCategory created successfully: ${subCategory.name}`);

    return new SubCategoryResponseDto({
      _id: subCategory._id.toString(),
      name: subCategory.name,
      slug: subCategory.slug,
      categoryId: subCategory.categoryId,
      isActive: subCategory.isActive,
      createdAt: subCategory.createdAt,
    });
  }

  /**
   * Get all subcategories
   * @param page
   * @param limit
   * @param isActive
   * @param categoryId
   * @returns
   */
  async getAllSubCategories(
    page: number = 1,
    limit: number = 10,
    isActive?: boolean,
    categoryId?: string,
  ): Promise<SubCategoryListResponseDto> {
    const result = await this.mongoService.findAllSubCategories(
      page,
      limit,
      isActive,
      categoryId,
    );

    const subCategories = result.subCategories.map(
      (subCategory) =>
        new SubCategoryResponseDto({
          _id: subCategory._id.toString(),
          name: subCategory.name,
          slug: subCategory.slug,
          categoryId: subCategory.categoryId,
          isActive: subCategory.isActive,
          createdAt: subCategory.createdAt,
        }),
    );

    return new SubCategoryListResponseDto(
      subCategories,
      result.total,
      result.page,
      result.limit,
    );
  }

  /**
   * Get subcategory by ID
   * @param subCategoryId
   * @returns
   */
  async getSubCategoryById(
    subCategoryId: string,
  ): Promise<SubCategoryResponseDto> {
    const subCategory =
      await this.mongoService.findSubCategoryById(subCategoryId);

    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }

    return new SubCategoryResponseDto({
      _id: subCategory._id.toString(),
      name: subCategory.name,
      slug: subCategory.slug,
      categoryId: subCategory.categoryId,
      isActive: subCategory.isActive,
      createdAt: subCategory.createdAt,
    });
  }

  /**
   * Update subcategory
   * @param subCategoryId
   * @param updateSubCategoryDto
   * @returns
   */
  async updateSubCategory(
    subCategoryId: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategoryResponseDto> {
    // Check if subcategory exists
    const subCategory =
      await this.mongoService.findSubCategoryById(subCategoryId);
    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }

    // Prepare update data
    const updateData: {
      name?: string;
      slug?: string;
      isActive?: boolean;
    } = {};

    if (updateSubCategoryDto.name) {
      updateData.name = updateSubCategoryDto.name;
    }

    if (updateSubCategoryDto.slug) {
      updateData.slug = this.generateSlug(updateSubCategoryDto.slug);
      // Check if new slug conflicts with existing subcategory in same category
      const existingSubCategory =
        await this.mongoService.findSubCategoryBySlugAndCategory(
          updateData.slug,
          subCategory.categoryId,
        );
      if (
        existingSubCategory &&
        existingSubCategory._id.toString() !== subCategoryId
      ) {
        throw new ConflictException(
          'SubCategory with this slug already exists in this category',
        );
      }
    } else if (updateSubCategoryDto.name) {
      // If name changed but slug not provided, regenerate slug from name
      updateData.slug = this.generateSlug(updateSubCategoryDto.name);
      // Check if new slug conflicts
      const existingSubCategory =
        await this.mongoService.findSubCategoryBySlugAndCategory(
          updateData.slug,
          subCategory.categoryId,
        );
      if (
        existingSubCategory &&
        existingSubCategory._id.toString() !== subCategoryId
      ) {
        throw new ConflictException(
          'SubCategory with this slug already exists in this category',
        );
      }
    }

    if (updateSubCategoryDto.isActive !== undefined) {
      updateData.isActive = updateSubCategoryDto.isActive;
    }

    // Update subcategory
    const updatedSubCategory = await this.mongoService.updateSubCategoryById(
      subCategoryId,
      updateData,
    );

    if (!updatedSubCategory) {
      throw new NotFoundException('SubCategory not found');
    }

    this.logger.log(
      `SubCategory updated successfully: ${updatedSubCategory.name}`,
    );

    return new SubCategoryResponseDto({
      _id: updatedSubCategory._id.toString(),
      name: updatedSubCategory.name,
      slug: updatedSubCategory.slug,
      categoryId: updatedSubCategory.categoryId,
      isActive: updatedSubCategory.isActive,
      createdAt: updatedSubCategory.createdAt,
    });
  }

  /**
   * Delete subcategory
   * @param subCategoryId
   * @returns
   */
  async deleteSubCategory(subCategoryId: string): Promise<{ message: string }> {
    // Check if subcategory exists
    const subCategory =
      await this.mongoService.findSubCategoryById(subCategoryId);
    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }

    // Delete subcategory
    await this.mongoService.deleteSubCategoryById(subCategoryId);

    this.logger.log(`SubCategory deleted successfully: ${subCategory.name}`);

    return { message: 'SubCategory deleted successfully' };
  }
}
