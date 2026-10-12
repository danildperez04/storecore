import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSupplierDto {
  @IsString({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'El contacto debe ser texto' })
  @MaxLength(120, { message: 'El contacto no puede exceder 120 caracteres' })
  contactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: 'El correo no es válido' })
  @MaxLength(120, { message: 'El correo no puede exceder 120 caracteres' })
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto' })
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Las notas deben ser texto' })
  @MaxLength(2000, { message: 'Las notas no pueden exceder 2000 caracteres' })
  notes?: string;
}
