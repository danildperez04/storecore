import { describe, expect, it, beforeEach } from 'vitest';
import { AllExceptionsFilter } from './all-exceptions.filter.js';
import { HttpException, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { ArgumentsHost } from '@nestjs/common';

/**
 * Pruebas del manejo global de excepciones.
 *
 * El filtro traduce los errores internos a mensajes que el usuario entienda.
 * Es donde vive la logica de negocio de los errores de PostgreSQL: convertir
 * una violacion de unicidad en 409 y una de integridad en 400 evita que el
 * cliente vea el error crudo de la base de datos.
 */

interface CapturedResponse {
  statusCode: number;
  body: Record<string, unknown>;
}

function makeHost(): { host: ArgumentsHost; captured: CapturedResponse } {
  const captured: CapturedResponse = { statusCode: 0, body: {} };
  const response = {
    status(code: number) {
      captured.statusCode = code;
      return this;
    },
    json(body: Record<string, unknown>) {
      captured.body = body;
      return this;
    },
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({ url: '/api/v1/branches', method: 'POST' }),
    }),
  } as unknown as ArgumentsHost;
  return { host, captured };
}

function invoke(filter: AllExceptionsFilter, exception: unknown): CapturedResponse {
  const { host, captured } = makeHost();
  filter.catch(exception, host);
  return captured;
}

/** Error de PostgreSQL con un codigo concreto (23505, 23503, 23514). */
function pgError(code: string, constraint?: string): QueryFailedError {
  const driverError = Object.assign(new Error('driver error'), { code, constraint });
  return new QueryFailedError('SELECT 1', [], driverError as never);
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  it('devuelve el status y el mensaje de una HttpException', () => {
    const result = invoke(filter, new HttpException('Recurso no encontrado', HttpStatus.NOT_FOUND));

    expect(result.statusCode).toBe(404);
    // El filtro devuelve el mensaje tal cual, sin reescribirlo.
    expect(result.body.message).toBe('Recurso no encontrado');
    expect(result.body.path).toBe('/api/v1/branches');
    expect(result.body.timestamp).toBeTruthy();
  });

  it('une los mensajes cuando la validacion devuelve un arreglo', () => {
    const result = invoke(
      filter,
      new HttpException(
        { message: ['El código es obligatorio', 'El nombre es obligatorio'], error: 'Bad Request' },
        HttpStatus.BAD_REQUEST,
      ),
    );

    expect(result.statusCode).toBe(400);
    expect(result.body.message).toBe('El código es obligatorio; El nombre es obligatorio');
    expect(result.body.details).toEqual(['El código es obligatorio', 'El nombre es obligatorio']);
  });

  it('traduce una violacion de unicidad a 409 sin filtrar el SQL', () => {
    const result = invoke(filter, pgError('23505', 'uq_branch_code'));

    expect(result.statusCode).toBe(409);
    expect(result.body.message).toContain('Ya existe');
    // El mensaje de PostgreSQL no debe llegar al cliente.
    expect(JSON.stringify(result.body)).not.toContain('SELECT');
  });

  it('traduce una violacion de llave foranea a 409', () => {
    const result = invoke(filter, pgError('23503', 'fk_product_stock_product'));

    expect(result.statusCode).toBe(409);
    expect(result.body.message).toContain('no existe');
  });

  it('traduce una violacion de CHECK a 400 con una pista util', () => {
    // Es el caso del stock negativo: el mensaje debe dizer que revisar, sin
    //nerse en detalles de la base.
    const result = invoke(filter, pgError('23514', 'ck_product_stock_quantity'));

    expect(result.statusCode).toBe(400);
    expect(result.body.message).toContain('integridad');
  });

  it('oculta el detalle de un error desconocido y devuelve 500', () => {
    const result = invoke(filter, new Error('ECONNRESET en /var/secreto/config.json'));

    expect(result.statusCode).toBe(500);
    expect(result.body.message).not.toContain('ECONNRESET');
    expect(result.body.message).not.toContain('/var/secreto');
  });

  it('nunca expone una traza de pila al cliente', () => {
    const result = invoke(filter, new Error('fallo interno con datos sensibles'));

    expect(result.body).not.toHaveProperty('stack');
    expect(JSON.stringify(result.body)).not.toContain('at Object');
  });
});
