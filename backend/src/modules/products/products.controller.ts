import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service.js';
import {
  CreateProductDto,
  ProductAutocompleteDto,
  ProductFiltersDto,
  UpdateProductDto,
} from './dto/index.js';
import { Product } from './entities/product.entity.js';
import type { ProductAutocompleteResult } from './products.types.js';
import { PaginatedResponse } from '#common/dto/pagination.dto.js';
import { CurrentBranchId, CurrentUser } from '#common/decorators/current-user.decorator.js';
import { Roles } from '#common/decorators/roles.decorator.js';
import { UserRole } from '#common/enums/domain.enums.js';

@ApiTags('Productos')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar productos con búsqueda, filtros y paginación (RF-11)' })
  findAll(@Query() filters: ProductFiltersDto): Promise<PaginatedResponse<Product>> {
    return this.service.findAll(filters);
  }

  @Get('autocomplete')
  @ApiOperation({
    summary: 'Autocompletado para el POS: búsqueda rápida con stock de la sucursal (RF-11)',
  })
  autocomplete(
    @Query() dto: ProductAutocompleteDto,
    @CurrentBranchId() branchId: number | null,
  ): Promise<ProductAutocompleteResult[]> {
    return this.service.autocomplete(dto.q, branchId, dto.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por su identificador' })
  @ApiResponse({ status: 404, description: 'El producto no existe' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.service.findOneOrFail(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Crear un producto, con stock inicial opcional por sucursal (RF-09, RF-13)',
  })
  @ApiResponse({ status: 409, description: 'El SKU o el código de barras ya existe' })
  @ApiResponse({ status: 400, description: 'El precio de venta no es mayor al de compra' })
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser('id') userId: number,
    @CurrentBranchId() currentBranchId: number | null,
  ): Promise<Product> {
    return this.service.create({
      ...dto,
      branchId: dto.branchId ?? currentBranchId ?? undefined,
      userId,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un producto (solo ADMIN)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto): Promise<Product> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desactivar un producto (borrado lógico, solo ADMIN)' })
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.service.deactivate(id);
    return { message: 'Producto desactivado.' };
  }
}
