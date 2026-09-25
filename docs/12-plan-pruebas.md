# Plan de Pruebas — StoreCore

**Versión:** 1.1.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

---

## 1. Objetivos

| #   | Objetivo                                          | Métrica                                 | Meta            |
| --- | ------------------------------------------------- | --------------------------------------- | --------------- |
| 1   | Detectar defectos antes de que lleguen al usuario | Defectos escapados por sprint           | ≤ 2             |
| 2   | Garantizar la integridad del inventario           | Casos de prueba de stock y concurrencia | 100 % cubiertos |
| 3   | Verificar los flujos de negocio críticos          | Cobertura de los 6 módulos del MVP      | 100 %           |
| 4   | Asegurar mantenibilidad                           | Cobertura de líneas en backend          | ≥ 70 % (RNF-08) |
| 5   | Validar con el usuario real                       | Casos de la checklist UAT ejecutados    | 100 %           |

## 2. Pirámide de Pruebas

```text
                        ╱╲
                       ╱  ╲
                      ╱ UAT ╲          8–12 casos por sprint
                     ╱________╲        El dueño valida en su tienda
                    ╱          ╲
                   ╱   E2E      ╲      25–35 casos
                  ╱______________╲    Flujos completos con Supertest
                 ╱                ╲
                ╱  Integración     ╲  60–80 casos
               ╱____________________╲ Servicios contra PostgreSQL real
              ╱                      ╲
             ╱     Unitarias          ╲  120–160 casos
            ╱____________________________╲ Lógica aislada, sin base de datos
```

| Nivel           | Qué prueba                      | Herramienta        | Ubicación                              | Velocidad           |
| --------------- | ------------------------------- | ------------------ | -------------------------------------- | ------------------- |
| **Unitaria**    | Una función o método aislado    | Vitest             | `*.spec.ts` junto al código            | Milisegundos        |
| **Integración** | Un servicio contra la base real | Vitest + Supertest | `test/*.e2e-spec.ts`                   | Segundos            |
| **E2E**         | Un flujo completo de usuario    | Supertest          | `test/*.e2e-spec.ts`                   | Decenas de segundos |
| **UAT**         | El sistema frente al dueño      | Manual             | [Checklist 15](15-checklist-uat-s1.md) | Horas               |

## 3. Estrategia por Módulo

| Módulo             | Riesgo      | Enfoque                                                                   | Casos mínimos |
| ------------------ | ----------- | ------------------------------------------------------------------------- | ------------- |
| **Auth**           | Alto        | Casos de borde en contraseñas, expiración de token, roles                 | 15            |
| **Usuarios**       | Medio       | Validación de DTO, asignación de rol y sucursal                           | 8             |
| **Sucursales**     | Bajo        | CRUD, código único, borrado lógico                                        | 6             |
| **Catálogo**       | Alto        | Búsqueda, filtros, validación de precios, desactivación lógica            | 18            |
| **Inventario**     | **Crítico** | Todos los tipos de movimiento, ajustes, kardex, alertas, **concurrencia** | 25            |
| **Punto de venta** | **Crítico** | Cálculo de totales, descuentos, stock insuficiente, folio, **atómica**    | 30            |
| **Compras**        | Alto        | Estados, recepción total y parcial, transacción                           | 18            |
| **Clientes**       | Alto        | Cargo, abono, límite de crédito, estado de cuenta                         | 15            |
| **Reportes**       | Medio       | Exactitud de agregados, periodos vacíos, exportación                      | 15            |
| **Caja**           | Alto        | Arqueo, diferencia, un turno abierto por sucursal                         | 12            |

**Total estimado: 162 casos automáticos + 8 a 12 de UAT por sprint.**

## 4. Niveles en Detalle

### 4.1 Pruebas Unitarias

Prueban lógica aislada, sin base de datos ni HTTP. Son rápidas y deben ser la mayoría.

**Casos clave del módulo de ventas** (`sales.service.spec.ts`):

| Caso                                | Entrada                              | Resultado esperado                           |
| ----------------------------------- | ------------------------------------ | -------------------------------------------- |
| Calcula subtotal                    | 3 productos con cantidades y precios | Subtotal correcto con redondeo a 2 decimales |
| Calcula descuento por monto         | Subtotal 100, descuento 15           | Total 85                                     |
| Calcula descuento por porcentaje    | Subtotal 200, descuento 10 %         | Total 180                                    |
| Rechaza descuento mayor al subtotal | Subtotal 50, descuento 60            | Error 400                                    |
| Total con descuento cero            | Subtotal 100, descuento 0            | Total 100 (caso de regresión)                |
| Redondea a 2 decimales              | Precio 12.345, cantidad 3            | Total 37.04 (redondeo half-up)               |
| Calcula el cambio                   | Total 87, efectivo 100               | Cambio 13                                    |

**Casos clave de inventario** (`inventory.service.spec.ts`):

| Caso                               | Entrada              | Resultado esperado                             |
| ---------------------------------- | -------------------- | ---------------------------------------------- |
| Entrada suma stock                 | Stock 50, entrada 20 | Stock 70, movimiento `PURCHASE`                |
| Ajuste positivo                    | Stock 50, conteo 55  | Stock 55, movimiento `ADJUSTMENT`              |
| Ajuste negativo                    | Stock 50, conteo 45  | Stock 45, movimiento `ADJUSTMENT`              |
| Merma descuenta                    | Stock 50, merma 5    | Stock 45, movimiento `WASTE`                   |
| **Rechaza stock negativo**         | Stock 10, merma 15   | Error 409, stock sin cambios                   |
| **Rechaza venta sin stock**        | Stock 10, venta 15   | Error 409, stock sin cambios                   |
| Registra el movimiento con usuario | Cualquier movimiento | `user_id` presente (RNF-11)                    |
| Registra el stock previo y nuevo   | Cualquier movimiento | `previous_quantity` y `new_quantity` correctos |
| Detecta stock bajo                 | Stock 5, mínimo 10   | Aparece en la lista de alertas                 |
| No alerta con stock sano           | Stock 50, mínimo 10  | No aparece en las alertas                      |

**Casos clave de crédito** (`customers.service.spec.ts`):

| Caso                          | Entrada                        | Resultado esperado              |
| ----------------------------- | ------------------------------ | ------------------------------- |
| Cargo suma saldo              | Saldo 100, venta a crédito 50  | Saldo 150                       |
| Abono resta saldo             | Saldo 100, abono 30            | Saldo 70                        |
| **Rechaza rebasar el límite** | Saldo 90, límite 100, venta 50 | Error 409                       |
| Permite venta igual al límite | Saldo 50, límite 100, venta 50 | Saldo 100, permitido            |
| Calcula el saldo              | 3 cargos, 2 abonos             | Suma algebraica correcta        |
| Cliente sin adeudo no aparece | Saldo 0                        | No está en la lista de deudores |

### 4.2 Pruebas de Integración

Verifican que un módulo funciona con la base de datos real y que las rutas HTTP
responden correctamente. Se ejecutan contra un PostgreSQL de pruebas, nunca contra
producción.

**Flujos E2E críticos:**

```text
Flujo 1 — Autenticación y roles
  POST /auth/login (válido)            → 201 + token
  GET  /auth/me (sin token)            → 401
  GET  /auth/me (token válido)         → 200 + usuario
  GET  /auth/me (token expirado)       → 401
  POST /auth/login (contraseña mala)   → 401

Flujo 2 — Permisos por rol
  Login como ADMIN   → POST /products    → 201
  Login como CASHIER → POST /products    → 403
  Login como CASHIER → GET  /products    → 200
  Login como CASHIER → GET  /reports/sales → 403

Flujo 3 — Catálogo completo
  POST   /categories          → 201
  POST   /suppliers           → 201
  POST   /products            → 201 + stock inicial
  GET    /products?search=sab → 200 + 1 resultado
  PATCH  /products/:id        → 200
  DELETE /products/:id        → 200 (lógico)
  GET    /products?search=sab → 200 + 0 resultados (inactivo)

Flujo 4 — Compra y recepción
  POST   /purchase-orders        → 201 (DRAFT)
  PATCH  /purchase-orders/:id/send → 200 (ORDERED)
  PATCH  /purchase-orders/:id/receive → 200 (RECEIVED)
  GET    /inventory/stock        → stock incrementado exactamente
  GET    /inventory/movements    → movimiento PURCHASE registrado

Flujo 5 — Venta completa
  POST /cash/open               → 201
  POST /sales (3 productos)     → 201 + folio + total
  GET  /inventory/stock         → stock descontado
  GET  /inventory/movements     → 3 movimientos SALE
  POST /cash/close              → 200 + diferencia = 0

Flujo 6 — Venta a crédito
  POST   /customers                → 201
  POST   /sales (CREDIT)           → 201
  GET    /customers/:id/statement  → 200 + saldo = total de la venta
  POST   /customers/:id/payments   → 201
  GET    /customers/:id/statement  → 200 + saldo reducido
  POST   /sales (CREDIT) sobre el límite → 409

Flujo 7 — Anulación
  POST  /sales                       → 201
  PATCH /sales/:id/cancel            → 200 (CANCELLED)
  GET   /inventory/stock             → stock devuelto
  GET   /inventory/movements         → movimiento RETURN registrado
  POST  /sales/:id/cancel (otra vez) → 409

Flujo 8 — Integridad de stock bajo concurrencia  (el más importante)
  Dos ventas simultáneas del mismo producto con stock 10,
  cada una por 8 unidades.  →  UNA debe funcionar y la otra fallar con 409.
  El stock final debe ser 2. Nunca 0, nunca -6.
```

### 4.3 Pruebas de concurrencia

Esta es la prueba que garantiza RNF-03. Se ejecuta en el Sprint 2 y se repite
cuando se toque el motor de stock.

```ts
describe('Integridad de stock bajo concurrencia (RNF-03)', () => {
  it('permite una sola venta cuando dos compiten por el mismo stock', async () => {
    // Stock inicial: 10 unidades
    await createProductWithStock(10);

    // Dos ventas concurrentes de 8 unidades cada una
    const [a, b] = await Promise.allSettled([
      createSale({ items: [{ productId, quantity: 8 }] }),
      createSale({ items: [{ productId, quantity: 8 }] }),
    ]);

    // Exactamente una debe tener éxito
    const exitosas = [a, b].filter((r) => r.status === 'fulfilled');
    const fallidas = [a, b].filter((r) => r.status === 'rejected');
    expect(exitosas).toHaveLength(1);
    expect(fallidas).toHaveLength(1);

    // La fallida debe ser por stock insuficiente
    const error = (fallidas[0] as PromiseRejectedResult).reason;
    expect(error.status).toBe(409);

    // El stock nunca queda negativo
    const stock = await getStock(productId);
    expect(stock).toBe(2);
  });
});
```

### 4.4 Pruebas de frontend

Con **Vitest** y **Testing Library**, la lógica de presentación.

| Ámbito                    | Qué se prueba                                       | Ejemplo                                    |
| ------------------------- | --------------------------------------------------- | ------------------------------------------ |
| Utilidades de formato     | Moneda y fecha (RNF-13)                             | `formatMoney(1234.5)` → `$1,234.50`        |
| Store del carrito         | Agregar, quitar, cambiar cantidad, calcular totales | Agregar 2 × `$10` → subtotal 20            |
| Validación de formularios | Reglas de `zod`                                     | Precio de venta menor al de compra → error |
| Componentes               | Renderizado, estados, interacción                   | `<StatCard>` muestra el monto y el ícono   |
| Guards de ruta            | Redirección sin sesión                              | Sin token → redirige a `/login`            |
| Manejo de errores         | Mensaje visible ante fallo de API                   | Error 409 → "Stock insuficiente"           |

### 4.5 UAT

La ejecuta el dueño en su tienda. Ver la
[Checklist UAT (15)](15-checklist-uat-s1.md).

## 5. Cobertura por Requerimiento

| Requerimiento                          | Riesgo      | Nivel de prueba          | Caso clave                          |
| -------------------------------------- | ----------- | ------------------------ | ----------------------------------- |
| RF-01 Login con JWT                    | Alto        | U + I + E                | Token válido, inválido y expirado   |
| RF-02 Roles                            | Alto        | U + I                    | Cajero recibe 403 en rutas de admin |
| RF-09 CRUD de productos                | Alto        | I + E                    | Crear, editar, desactivar           |
| RF-10 Validación de precios            | Medio       | U                        | Venta ≤ compra rechazado            |
| RF-11 Búsqueda                         | Alto        | I + E                    | Búsqueda por nombre, SKU, código    |
| RF-15 Entrada de mercancía             | Alto        | U + I                    | Suma stock y registra movimiento    |
| RF-16 Ajuste                           | Medio       | U                        | Conteo con diferencia               |
| RF-17 Merma                            | Medio       | U                        | Descuenta y registra                |
| RF-18 Alerta de stock bajo             | Alto        | U + I                    | Aparece bajo mínimo                 |
| RF-19 Kardex                           | Alto        | I                        | Historial completo del producto     |
| **RF-20 Stock nunca negativo**         | **Crítico** | **U + I + concurrencia** | **Rechazo de operación imposible**  |
| RF-22 Totales en tiempo real           | Alto        | U                        | Subtotal, descuento, total          |
| RF-23 Descuento                        | Medio       | U                        | Monto y porcentaje                  |
| **RF-24 Validación de stock en venta** | **Crítico** | **U + I**                | **Rechazo con 409**                 |
| RF-25 Métodos de pago                  | Alto        | I                        | Efectivo, tarjeta, transferencia    |
| RF-26 Ticket                           | Medio       | U                        | Contenido del ticket                |
| RF-27 Folio consecutivo                | Medio       | I                        | Sin duplicados con concurrencia     |
| RF-28 Anulación                        | Alto        | U + I                    | Devuelve el stock                   |
| RF-29 Corte de caja                    | Alto        | I                        | Arqueo y diferencia                 |
| RF-30 Orden de compra                  | Alto        | I                        | Creación en `DRAFT`                 |
| RF-32 Recepción                        | Alto        | U + I                    | Suma stock en transacción           |
| RF-37 Venta a crédito                  | Alto        | U + I                    | Suma al saldo                       |
| RF-38 Límite de crédito                | Alto        | U + I                    | Rechazo al rebasar                  |
| RF-39 Abono                            | Alto        | U + I                    | Reduce el saldo                     |
| RF-43 Dashboard                        | Medio       | I                        | Los 5 indicadores                   |
| RF-44 a RF-50 Reportes                 | Medio       | U                        | Agregados correctos                 |

## 6. Plan de Pruebas por Sprint

| Sprint | Pruebas nuevas                                 | Casos   | Riesgo cubierto | Prueba de regresión relevante |
| ------ | ---------------------------------------------- | ------- | --------------- | ----------------------------- |
| S0     | Auth, roles, salud, migración, seeder          | 25      | Alto            | —                             |
| S1     | Catálogo, búsqueda, filtros, formato           | 30      | Medio           | Auth y roles                  |
| S2     | Movimientos, alertas, kardex, **concurrencia** | 35      | **Crítico**     | Catálogo                      |
| S3     | Venta, totales, folios, anulación, caja        | 45      | **Crítico**     | Inventario completo           |
| S4     | Órdenes, recepción total y parcial             | 28      | Alto            | Inventario                    |
| S5     | Crédito, abonos, límites                       | 25      | Alto            | Ventas y clientes             |
| S6     | Reportes, dashboard, CSV                       | 22      | Medio           | Todos                         |
| S7     | UAT completa, rendimiento, navegadores         | 30      | Todos           | Todo                          |
|        | **Total**                                      | **240** |                 |                               |

## 7. Criterios de Aceptación de Pruebas

Una historia pasa si:

- [ ] Todas las pruebas nuevas pasan.
- [ ] Ninguna prueba existente se rompió.
- [ ] La cobertura se mantiene o sube.
- [ ] Los casos críticos del requisito están cubiertos.
- [ ] CI en verde.

Un sprint pasa si:

- [ ] Todas las historias comprometidas están `TERMINADO`.
- [ ] Los 8–12 casos de UAT del sprint están ejecutados.
- [ ] Ningún defecto de severidad alta o crítica está abierto.

## 8. Datos de Prueba

### 8.1 Fixtures

Se usan factories deterministas, con unicidad por ejecución para permitir pruebas
concurrentes sobre la misma base:

```ts
export const makeProduct = (overrides = {}) => ({
  sku: `SKU${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
  barcode: `750${Date.now()}`,
  name: 'Producto de prueba',
  purchasePrice: 10.0,
  salePrice: 15.0,
  minStock: 5,
  ...overrides,
});
```

### 8.2 Seeder de desarrollo

50 productos reales de abarrotes con nombres, códigos de barras y precios verosímiles,
para que las pruebas manuales parezcan el negocio real y no un conjunto de datos
artificial.

### 8.3 Aislamiento

- Cada prueba de integración crea sus datos y limpia al terminar.
- La base de pruebas es `storecore_test`, separada de desarrollo y producción.
- Las pruebas corren en serie dentro de una suite para evitar interferencia, salvo
  las de concurrencia, que lo requieren en paralelo.

## 9. Severidad de Defectos

| Severidad   | Definición                                  | Ejemplo                                        | Plazo de corrección         |
| ----------- | ------------------------------------------- | ---------------------------------------------- | --------------------------- |
| **Crítica** | El sistema no funciona o se pierden datos   | No se puede cobrar; el stock se descuadra      | Inmediato                   |
| **Alta**    | Una función principal falla sin alternativa | No se puede generar un reporte; el login falla | Antes del cierre del sprint |
| **Media**   | Función afectada con rodeo disponible       | Un filtro no funciona, hay alternativa manual  | Sprint siguiente            |
| **Baja**    | Cosmético o de conveniencia                 | Un texto mal alineado                          | Cuando se pueda             |

## 10. Estrategia de Regresión

| Momento             | Alcance de la regresión                        | Duración estimada |
| ------------------- | ---------------------------------------------- | ----------------- |
| Cada PR             | Pruebas del módulo afectado + sus dependencias | 1–2 min           |
| Cierre de sprint    | Todos los módulos                              | 5–8 min           |
| Antes de un release | Todo + pruebas de humo manuales                | 15 min            |

**Pruebas de humo para releases** (lista rápida de 10 pasos):

```text
 1. Levantar con docker compose up --build
 2. GET /api/v1/health responde ok
 3. Login con el administrador
 4. Crear un producto
 5. Registrar una entrada de stock
 6. Registrar una venta
 7. Confirmar que el stock bajó
 8. Abrir y cerrar caja
 9. Generar un reporte de ventas
10. Revisar que no hay errores en los logs
```

## 11. Cobertura de Código

```bash
# Backend: solo unitarias
pnpm --filter backend test:cov

# Backend: unitarias + e2e (la cobertura real del proyecto)
pnpm --filter backend test:all

# Salida con resumen por archivo
# File              | % Stmts | % Branch | % Funcs | % Lines |
# ------------------|---------|----------|---------|---------|
# all files         |   78.4  |    71.2  |   82.1  |   77.9  |
# services          |   91.2  |    84.5  |   94.0  |   90.8  |
# controllers       |   95.1  |    88.3  |   96.4  |   94.7  |
# entities          |   100   |    100   |   100   |   100   |
```

| Módulo                               | Cobertura mínima  |
| ------------------------------------ | ----------------- |
| Servicios de stock, ventas y crédito | 90 %              |
| Servicios de compras y caja          | 80 %              |
| Servicios de reportes                | 70 %              |
| Controladores                        | 80 %              |
| Entidades y DTOs                     | 90 %              |
| **Total del backend**                | **70 %** (RNF-08) |

Se **excluye** de la cobertura: archivos de configuración, entidades puras, DTOs sin
lógica y `main.ts`.

## 12. Herramientas

| Herramienta     | Uso                                | Ubicación                      |
| --------------- | ---------------------------------- | ------------------------------ |
| Vitest          | Pruebas unitarias del backend      | `backend/vitest.config.ts`     |
| Supertest       | Peticiones HTTP en las pruebas     | `backend/test/`                |
| Vitest          | Pruebas de integración del backend | `backend/vitest.e2e.config.ts` |
| Vitest          | Pruebas del frontend               | `frontend/vite.config.ts`      |
| Testing Library | Pruebas de componentes             | `frontend/src/**/*.test.tsx`   |
| jsdom           | Entorno de navegador para Vitest   | Configurado en Vite            |
| curl            | Pruebas de humo manuales           | `backend/requests/`            |
| Docker Compose  | Entorno de pruebas integrado       | Raíz del proyecto              |

## 13. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                                                                                    |
| ------- | ----------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento                                                                 |
| 1.1.0   | 25 sep 2026 | Equipo StoreCore | Sustitución de Jest por Vitest en el backend (TypeScript 6 eliminó la vía CommonJS de ts-jest) |
