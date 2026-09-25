/**
 * Tipos de autenticacion compartidos entre el servicio y la estrategia JWT.
 * Se separan para que la estrategia no dependa del servicio.
 */

/** Credenciales de inicio de sesion. */
export interface LoginCredentials {
  username: string;
  password: string;
}

/** Contenido que viaja dentro del JWT. */
export interface JwtPayload {
  /** id del usuario */
  sub: number;
  username: string;
  role: 'ADMIN' | 'CASHIER';
  /** sucursal asignada; null cuando el ADMIN opera sobre todas */
  branchId: number | null;
}
