import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CategoryListResponseDto } from './dto/category-list-response.dto';
import { AuthGuard } from '../../guard/auth.guard';
import { RolesGuard } from '../../guard/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../enums/role.enum';
import { User } from '../../decorators/user.decorator';
import type { JwtTokenInterface } from '../../interface/jwt.token.interface';

@Controller('category')
@UseGuards(AuthGuard, RolesGuard)
@ApiSecurity('x-access-token')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Create category (admin only)' })
  @ApiCreatedResponse({
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiConflictResponse({
    description: 'Category with this slug already exists',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only admin can create categories',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN)
  @Post()
  async createCategory(
    @User() userInfo: JwtTokenInterface,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.createCategory(createCategoryDto, userInfo);
  }

  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    enum: ['true', 'false'],
    description: 'Filter by active status',
  })
  @ApiOkResponse({
    description: 'Categories retrieved successfully',
    type: CategoryListResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only authenticated users can view categories',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN, Role.USER, Role.MANAGER)
  @Get()
  async getAllCategories(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
  ): Promise<CategoryListResponseDto> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const isActiveFilter = isActive ? isActive === 'true' : undefined;
    return this.categoryService.getAllCategories(
      pageNumber,
      limitNumber,
      isActiveFilter,
    );
  }

  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID',
  })
  @ApiOkResponse({
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only authenticated users can view categories',
  })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN, Role.USER, Role.MANAGER)
  @Get(':categoryId')
  async getCategoryById(
    @Param('categoryId') categoryId: string,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.getCategoryById(categoryId);
  }

  @ApiOperation({ summary: 'Update category (admin only)' })
  @ApiParam({ name: 'categoryId' })
  @ApiOkResponse({
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiConflictResponse({
    description: 'Category with this slug already exists',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only admin can update categories',
  })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN)
  @Put(':categoryId')
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.updateCategory(categoryId, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Delete category (admin only)' })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID',
  })
  @ApiOkResponse({
    description: 'Category deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Category deleted successfully',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - Category has subcategories',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only admin can delete categories',
  })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN)
  @Delete(':categoryId')
  async deleteCategory(
    @Param('categoryId') categoryId: string,
  ): Promise<{ message: string }> {
    return this.categoryService.deleteCategory(categoryId);
  }
}
