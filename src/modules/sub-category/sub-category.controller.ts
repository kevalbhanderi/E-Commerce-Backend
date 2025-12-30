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
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategoryResponseDto } from './dto/sub-category-response.dto';
import { SubCategoryListResponseDto } from './dto/sub-category-list-response.dto';
import { AuthGuard } from '../../guard/auth.guard';
import { RolesGuard } from '../../guard/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../enums/role.enum';

@Controller('sub-category')
@UseGuards(AuthGuard, RolesGuard)
@ApiSecurity('x-access-token')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @ApiOperation({ summary: 'Create subcategory (admin only)' })
  @ApiCreatedResponse({
    description: 'SubCategory created successfully',
    type: SubCategoryResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiConflictResponse({
    description: 'SubCategory with this slug already exists in this category',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only admin can create subcategories',
  })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN)
  @Post()
  async createSubCategory(
    @Body() createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategoryResponseDto> {
    return this.subCategoryService.createSubCategory(createSubCategoryDto);
  }

  @ApiOperation({ summary: 'Get all subcategories' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    enum: ['true', 'false'],
    description: 'Filter by active status',
  })
  @ApiOkResponse({
    description: 'SubCategories retrieved successfully',
    type: SubCategoryListResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only authenticated users can view subcategories',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN, Role.USER, Role.MANAGER)
  @Get()
  async getAllSubCategories(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
    @Query('categoryId') categoryId?: string,
  ): Promise<SubCategoryListResponseDto> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const isActiveFilter = isActive ? isActive === 'true' : undefined;
    return this.subCategoryService.getAllSubCategories(
      pageNumber,
      limitNumber,
      isActiveFilter,
      categoryId,
    );
  }

  @ApiOperation({ summary: 'Get subcategory by ID' })
  @ApiParam({
    name: 'subCategoryId',
    description: 'SubCategory ID',
  })
  @ApiOkResponse({
    description: 'SubCategory retrieved successfully',
    type: SubCategoryResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only authenticated users can view subcategories',
  })
  @ApiNotFoundResponse({ description: 'SubCategory not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN, Role.USER, Role.MANAGER)
  @Get(':subCategoryId')
  async getSubCategoryById(
    @Param('subCategoryId') subCategoryId: string,
  ): Promise<SubCategoryResponseDto> {
    return this.subCategoryService.getSubCategoryById(subCategoryId);
  }

  @ApiOperation({ summary: 'Update subcategory (admin only)' })
  @ApiParam({ name: 'subCategoryId' })
  @ApiOkResponse({
    description: 'SubCategory updated successfully',
    type: SubCategoryResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiConflictResponse({
    description: 'SubCategory with this slug already exists in this category',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only admin can update subcategories',
  })
  @ApiNotFoundResponse({ description: 'SubCategory not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN)
  @Put(':subCategoryId')
  async updateSubCategory(
    @Param('subCategoryId') subCategoryId: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategoryResponseDto> {
    return this.subCategoryService.updateSubCategory(
      subCategoryId,
      updateSubCategoryDto,
    );
  }

  @ApiOperation({ summary: 'Delete subcategory (admin only)' })
  @ApiParam({
    name: 'subCategoryId',
    description: 'SubCategory ID',
  })
  @ApiOkResponse({
    description: 'SubCategory deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'SubCategory deleted successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only admin can delete subcategories',
  })
  @ApiNotFoundResponse({ description: 'SubCategory not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN)
  @Delete(':subCategoryId')
  async deleteSubCategory(
    @Param('subCategoryId') subCategoryId: string,
  ): Promise<{ message: string }> {
    return this.subCategoryService.deleteSubCategory(subCategoryId);
  }
}
