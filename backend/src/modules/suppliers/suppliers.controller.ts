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
import { SuppliersService } from './suppliers.service.js';
import { CreateSupplierDto, SupplierFiltersDto, UpdateSupplierDto } from './dto/index.js';
import { Supplier } from './entities/supplier.entity.js';
import { PaginatedResponse } from '#common/dto/pagination.dto.js';
import { Roles } from '#common/decorators/roles.decorator.js';
import { UserRole } from '#common/enums/domain.enums.js';

@ApiTags('Proveedores')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar proveedores con filtros y paginación (RF-08)' })
  findAll(@Query() filters: SupplierFiltersDto): Promise<PaginatedResponse<Supplier>> {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un proveedor por su identificador' })
  @ApiResponse({ status: 404, description: 'El proveedor no existe' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Supplier> {
    return this.service.findOneOrFail(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un proveedor (solo ADMIN)' })
  create(@Body() dto: CreateSupplierDto): Promise<Supplier> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un proveedor (solo ADMIN)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDto): Promise<Supplier> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desactivar un proveedor (borrado lógico, solo ADMIN)' })
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.service.deactivate(id);
    return { message: 'Proveedor desactivado.' };
  }
}
