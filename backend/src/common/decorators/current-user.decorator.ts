import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '#modules/users/entities/user.entity.js';

/** Payload que NestJS adjunta a la request tras validar el JWT. */
export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: User['role'];
  branchId: number | null;
}

/**
 * Inyecta el usuario autenticado en el parámetro de un handler.
 * Usar siempre junto con JwtAuthGuard: la request puede no tener `user`.
 */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = request.user;
    if (!user) return undefined;
    return field ? user[field] : user;
  },
);

/**
 * Sucursal efectiva de la petición.
 * Un ADMIN puede operar sobre cualquier sucursal pasando `x-branch-id`;
 * un CASHIER siempre trabaja en la suya (RN-10).
 */
export const CurrentBranchId = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context
    .switchToHttp()
    .getRequest<Request & { user?: AuthenticatedUser; headers: Record<string, unknown> }>();
  const user = request.user;
  if (!user) return undefined;

  const header = request.headers['x-branch-id'];
  if (user.role === 'ADMIN' && typeof header === 'string' && header.trim() !== '') {
    const parsed = Number(header);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return user.branchId;
});
