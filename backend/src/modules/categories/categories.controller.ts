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
import { CategoriesService } from './categories.service.js';
import { CategoryFiltersDto, CreateCategoryDto, UpdateCategoryDto } from './dto/index.js';
import { Category } from './entities/category.entity.js';
import { PaginatedResponse } from '#common/dto/pagination.dto.js';
import { Roles } from '#common/decorators/roles.decorator.js';
import { UserRole } from '#common/enums/domain.enums.js';

@ApiTags('Categorías')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorías con filtros y paginación (RF-07)' })
  findAll(@Query() filters: CategoryFiltersDto): Promise<PaginatedResponse<Category>> {
    return this.service.findAll(filters);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Árbol completo de categorías, para el selector jerárquico' })
  findTree(): Promise<Category[]> {
    return this.service.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por su identificador' })
  @ApiResponse({ status: 404, description: 'La categoría no existe' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    return this.service.findOneOrFail(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una categoría (solo ADMIN)' })
  @ApiResponse({ status: 404, description: 'La categoría padre no existe' })
  create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una categoría (solo ADMIN)' })
  @ApiResponse({ status: 400, description: 'El nuevo padre crearía un ciclo' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto): Promise<Category> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desactivar una categoría (borrado lógico, solo ADMIN)' })
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.service.deactivate(id);
    return { message: 'Categoría desactivada.' };
  }
}
