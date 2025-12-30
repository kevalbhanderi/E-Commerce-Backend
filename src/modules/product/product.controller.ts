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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductListResponseDto } from './dto/product-list-response.dto';
import { AuthGuard } from 'src/guard/auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { User } from 'src/decorators/user.decorator';
import type { JwtTokenInterface } from 'src/interface/jwt.token.interface';

@Controller('product')
@UseGuards(AuthGuard, RolesGuard)
@ApiSecurity('x-access-token')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Create product with image upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        categoryId: { type: 'string' },
        subCategoryId: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['name', 'description', 'price', 'categoryId', 'subCategoryId'],
    },
  })
  @ApiCreatedResponse({
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiConflictResponse({
    description: 'Product with this slug already exists',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only admin can create products',
  })
  @ApiNotFoundResponse({ description: 'Category or SubCategory not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createProduct(
    @User() userInfo: JwtTokenInterface,
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    return this.productService.createProduct(createProductDto, file, userInfo);
  }

  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    enum: ['true', 'false'],
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'subCategoryId',
    required: false,
    type: String,
    description: 'Filter by subcategory ID',
  })
  @ApiOkResponse({
    description: 'Products retrieved successfully',
    type: ProductListResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only authenticated users can view products',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN, Role.USER, Role.MANAGER)
  @Get()
  async getAllProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
    @Query('categoryId') categoryId?: string,
    @Query('subCategoryId') subCategoryId?: string,
  ): Promise<ProductListResponseDto> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const isActiveFilter = isActive ? isActive === 'true' : undefined;
    return this.productService.getAllProducts(
      pageNumber,
      limitNumber,
      isActiveFilter,
      categoryId,
      subCategoryId,
    );
  }

  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'productId' })
  @ApiOkResponse({
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only authenticated users can view products',
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN, Role.USER, Role.MANAGER)
  @Get('/:productId')
  async getProductById(
    @Param('productId') productId: string,
  ): Promise<ProductResponseDto> {
    return this.productService.getProductById(productId);
  }

  @ApiOperation({ summary: 'Update product and images' })
  @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       name: { type: 'string' },
  //       slug: { type: 'string' },
  //       description: { type: 'string' },
  //       price: { type: 'number' },
  //       isActive: { type: 'boolean' },
  //       image: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //     },
  //   },
  // })
  @ApiParam({ name: 'productId' })
  @ApiOkResponse({
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiConflictResponse({
    description: 'Product with this slug already exists',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only admin can update products',
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN)
  @Put(':productId')
  @UseInterceptors(FileInterceptor('image'))
  async updateProduct(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    return this.productService.updateProduct(productId, updateProductDto, file);
  }

  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'productId' })
  @ApiOkResponse({
    description: 'Product deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Product deleted successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only admin can delete products',
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Roles(Role.ADMIN)
  @Delete(':productId')
  async deleteProduct(
    @Param('productId') productId: string,
  ): Promise<{ message: string }> {
    return this.productService.deleteProduct(productId);
  }
}
