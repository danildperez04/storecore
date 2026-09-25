import {
  Body,
  Controller,
  Inject,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchesService } from './branches.service.js';
import type { CreateBranchInput, UpdateBranchInput } from './branches.types.js';
import { Branch } from './entities/branch.entity.js';
import { Roles } from '#common/decorators/roles.decorator.js';
import { UserRole } from '#common/enums/domain.enums.js';
import { PaginatedResponse, PaginationDto } from '#common/dto/pagination.dto.js';
import { ToBoolean, BOOLEAN_QUERY_MESSAGE } from '#common/transformers/to-boolean.transformer.js';

class BranchBodyDto {
  @IsString({ message: 'El código es obligatorio' })
  @MinLength(2, { message: 'El código debe tener al menos 2 caracteres' })
  @MaxLength(10, { message: 'El código no puede exceder 10 caracteres' })
  code!: string;

  @IsString({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(120, { message: 'El nombre no puede exceder 120 caracteres' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto' })
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  phone?: string;
}

class UpdateBranchDto extends BranchBodyDto {
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser verdadero o falso' })
  declare isActive?: boolean;
}

class BranchFiltersDto extends PaginationDto {
  @IsOptional()
  @ToBoolean()
  @IsBoolean({ message: BOOLEAN_QUERY_MESSAGE })
  declare isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}

@ApiTags('Sucursales')
@ApiBearerAuth()
@Controller('branches')
export class BranchesController {
  constructor(
    @Inject(BranchesService) private readonly service: BranchesService,
    @Inject(getRepositoryToken(Branch)) private readonly repository: Repository<Branch>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar sucursales con filtros y paginación (RF-04)' })
  async findAll(@Query() filters: BranchFiltersDto): Promise<PaginatedResponse<Branch>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const query = this.repository.createQueryBuilder('branch');
    if (filters.isActive !== undefined) {
      query.andWhere('branch.isActive = :isActive', { isActive: filters.isActive });
    }
    if (filters.search) {
      query.andWhere('(branch.name ILIKE :search OR branch.code ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    const [data, total] = await query
      .orderBy('branch.code', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return new PaginatedResponse(data, total, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sucursal por su identificador' })
  @ApiResponse({ status: 404, description: 'La sucursal no existe' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Branch> {
    return this.service.findOneOrFail(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una sucursal (solo ADMIN)' })
  @ApiResponse({ status: 409, description: 'El código ya existe' })
  create(@Body() dto: BranchBodyDto): Promise<Branch> {
    const input: CreateBranchInput = {
      code: dto.code,
      name: dto.name,
      address: dto.address ?? null,
      phone: dto.phone ?? null,
    };
    return this.service.create(input);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una sucursal (solo ADMIN)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBranchDto): Promise<Branch> {
    return this.service.update(id, dto as UpdateBranchInput);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desactivar una sucursal (borrado lógico, solo ADMIN)' })
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.service.deactivate(id);
    return { message: 'Sucursal desactivada.' };
  }
}

export { BranchBodyDto, UpdateBranchDto, BranchFiltersDto };
