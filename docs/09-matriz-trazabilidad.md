# Matriz de Trazabilidad — StoreCore

**Versión:** 1.1.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

Traza cada requerimiento hasta su historia, sprint, entidad de base de datos,
endpoint y prueba. Cumple el requisito de trazabilidad
**evidencia → requerimiento → implementación**.

---

## 1. Leyenda

| Columna            | Valores                                                     |
| ------------------ | ----------------------------------------------------------- |
| **Estado**         | `PENDIENTE` · `EN CURSO` · `IMPLEMENTADO` · `DESPLEGADO`    |
| **Tipo de prueba** | `U` unitaria · `I` integración · `E` e2e · `M` manual / UAT |
| **Prioridad**      | `Must` · `Should` · `Could` · `Won't`                       |

## 2. Autenticación, usuarios y sucursales

| RF    | HU    | Sprint | Endpoint                          | Entidad                  | Prueba                      | Tipo | Prioridad | Estado       |
| ----- | ----- | ------ | --------------------------------- | ------------------------ | --------------------------- | ---- | --------- | ------------ |
| RF-01 | HU-07 | S0     | `POST /api/v1/auth/login`         | `user`                   | `auth.service.spec.ts`      | U    | Must      | PENDIENTE    |
| RF-01 | HU-07 | S0     | `GET /api/v1/auth/me`             | `user`                   | `auth.e2e-spec.ts`          | E    | Must      | PENDIENTE    |
| RF-01 | HU-08 | S0     | —                                 | —                        | `LoginView.test.tsx`        | U    | Must      | PENDIENTE    |
| RF-02 | HU-09 | S0     | Middleware `RolesGuard`           | `user`                   | `roles.guard.spec.ts`       | U    | Must      | PENDIENTE    |
| RF-02 | HU-09 | S0     | Middleware `JwtAuthGuard`         | `user`                   | `auth.e2e-spec.ts`          | E    | Must      | PENDIENTE    |
| RF-03 | HU-10 | S0     | `POST/GET/PATCH /api/v1/users`    | `user`                   | `users.e2e-spec.ts`         | E    | Must      | PENDIENTE    |
| RF-04 | HU-11 | S0     | `POST/GET/PATCH /api/v1/branches` | `branch`                 | `branches.e2e-spec.ts`      | E    | Must      | PENDIENTE    |
| RF-05 | HU-12 | S0     | `PATCH /api/v1/auth/password`     | `user`                   | `auth.service.spec.ts`      | U    | Must      | PENDIENTE    |
| RF-06 | HU-10 | S0     | —                                 | `user.last_login_at`     | `auth.service.spec.ts`      | U    | Must      | IMPLEMENTADO |
| RF-06 | —     | S2     | —                                 | `stock_movement.user_id` | `inventory.service.spec.ts` | U    | Must      | PENDIENTE    |
| RF-06 | —     | S3     | —                                 | `sale.user_id`           | `sales.service.spec.ts`     | U    | Must      | PENDIENTE    |
| RF-51 | HU-05 | S0     | `GET /api/v1/health`              | —                        | `auth.e2e-spec.ts`          | E    | Must      | IMPLEMENTADO |

## 3. Catálogo

| RF    | HU    | Sprint | Endpoint                                                          | Entidad                    | Prueba                       | Tipo | Prioridad | Estado       |
| ----- | ----- | ------ | ----------------------------------------------------------------- | -------------------------- | ---------------------------- | ---- | --------- | ------------ |
| RF-07 | HU-13 | S1     | `POST/GET/PATCH /api/v1/categories`                               | `category`                 | `categories.e2e-spec.ts`     | E    | Must      | IMPLEMENTADO |
| RF-08 | HU-14 | S1     | `POST/GET/PATCH /api/v1/suppliers`                                | `supplier`                 | `suppliers.e2e-spec.ts`      | E    | Must      | IMPLEMENTADO |
| RF-09 | HU-15 | S1     | `POST /api/v1/products`                                           | `product`                  | `products.e2e-spec.ts`       | E    | Must      | IMPLEMENTADO |
| RF-10 | HU-15 | S1     | Validación de DTO                                                 | `product`                  | `create-product.dto.spec.ts` | U    | Must      | IMPLEMENTADO |
| RF-10 | HU-15 | S1     | `CHECK (sale_price > purchase_price)`                             | `product`                  | `products.e2e-spec.ts`       | E    | Must      | IMPLEMENTADO |
| RF-11 | HU-17 | S1     | `GET /api/v1/products?search=`                                    | `product`                  | `products.e2e-spec.ts`       | E    | Must      | IMPLEMENTADO |
| RF-11 | HU-18 | S1     | `GET /api/v1/products?categoryId=&supplierId=`                    | `product`                  | `products.e2e-spec.ts`       | E    | Must      | IMPLEMENTADO |
| RF-11 | HU-17 | S1     | `GET /api/v1/products/autocomplete?q=` (contrato para el POS, S3) | `product`, `product_stock` | `products.service.spec.ts`   | U    | Must      | IMPLEMENTADO |
| RF-12 | HU-16 | S1     | `DELETE /api/v1/products/:id` (lógico)                            | `product.is_active`        | `products.service.spec.ts`   | U    | Must      | IMPLEMENTADO |
| RF-13 | HU-19 | S1     | `POST /api/v1/products`                                           | `product_stock`            | `products.e2e-spec.ts`       | E    | Must      | IMPLEMENTADO |

## 4. Inventario

| RF    | HU    | Sprint | Endpoint                                        | Entidad                    | Prueba                          | Tipo | Prioridad | Estado    |
| ----- | ----- | ------ | ----------------------------------------------- | -------------------------- | ------------------------------- | ---- | --------- | --------- |
| RF-14 | HU-20 | S2     | `GET /api/v1/inventory/stock`                   | `product_stock`            | `inventory.e2e-spec.ts`         | E    | Must      | PENDIENTE |
| RF-15 | HU-21 | S2     | `POST /api/v1/inventory/movements` (PURCHASE)   | `stock_movement`           | `inventory.service.spec.ts`     | U    | Must      | PENDIENTE |
| RF-16 | HU-22 | S2     | `POST /api/v1/inventory/movements` (ADJUSTMENT) | `stock_movement`           | `inventory.service.spec.ts`     | U    | Must      | PENDIENTE |
| RF-17 | HU-23 | S2     | `POST /api/v1/inventory/movements` (WASTE)      | `stock_movement`           | `inventory.service.spec.ts`     | U    | Must      | PENDIENTE |
| RF-18 | HU-24 | S2     | `GET /api/v1/inventory/low-stock`               | `product_stock`, `product` | `inventory.service.spec.ts`     | U    | Must      | PENDIENTE |
| RF-18 | HU-24 | S2     | `GET /api/v1/inventory/low-stock`               | —                          | `LowStockBadge.test.tsx`        | U    | Must      | PENDIENTE |
| RF-19 | HU-25 | S2     | `GET /api/v1/inventory/movements?productId=`    | `stock_movement`           | `inventory.e2e-spec.ts`         | E    | Must      | PENDIENTE |
| RF-20 | HU-26 | S2     | Servicio de venta e inventario                  | `product_stock`            | `inventory.concurrency.spec.ts` | U    | Must      | PENDIENTE |
| RF-20 | HU-26 | S2     | `CHECK (quantity >= 0)`                         | `product_stock`            | `inventory.e2e-spec.ts`         | E    | Must      | PENDIENTE |

## 5. Punto de venta

| RF    | HU    | Sprint | Endpoint                                             | Entidad                 | Prueba                   | Tipo | Prioridad | Estado    |
| ----- | ----- | ------ | ---------------------------------------------------- | ----------------------- | ------------------------ | ---- | --------- | --------- |
| RF-21 | HU-27 | S3     | `GET /api/v1/products?barcode=`                      | `product.barcode`       | `PosView.test.tsx`       | U    | Must      | PENDIENTE |
| RF-21 | HU-27 | S3     | —                                                    | —                       | Manual con escáner       | M    | Must      | PENDIENTE |
| RF-22 | HU-28 | S3     | `POST /api/v1/sales/quote`                           | (sin persistir)         | `cart.store.spec.ts`     | U    | Must      | PENDIENTE |
| RF-22 | HU-28 | S3     | `POST /api/v1/sales`                                 | `sale_item`             | `sales.service.spec.ts`  | U    | Must      | PENDIENTE |
| RF-23 | HU-29 | S3     | `POST /api/v1/sales`                                 | `sale.discount`         | `sales.service.spec.ts`  | U    | Must      | PENDIENTE |
| RF-24 | HU-30 | S3     | `POST /api/v1/sales` → 409                           | `product_stock`         | `sales.service.spec.ts`  | U    | Must      | PENDIENTE |
| RF-25 | HU-31 | S3     | `POST /api/v1/sales`                                 | `sale.payment_method`   | `sales.e2e-spec.ts`      | E    | Must      | PENDIENTE |
| RF-26 | HU-32 | S3     | `GET /api/v1/sales/:id/ticket`                       | `sale`, `sale_item`     | `ticket.service.spec.ts` | U    | Must      | PENDIENTE |
| RF-27 | HU-32 | S3     | Secuencia por sucursal                               | `sale.sale_number`      | `sales.e2e-spec.ts`      | E    | Must      | PENDIENTE |
| RF-28 | HU-33 | S3     | `PATCH /api/v1/sales/:id/cancel`                     | `sale`, `product_stock` | `sales.service.spec.ts`  | U    | Must      | PENDIENTE |
| RF-29 | HU-34 | S3     | `POST /api/v1/cash/open` · `POST /api/v1/cash/close` | `cash_shift`            | `cash.e2e-spec.ts`       | E    | Must      | PENDIENTE |

## 6. Compras a proveedores

| RF    | HU    | Sprint | Endpoint                                    | Entidad                           | Prueba                      | Tipo | Prioridad | Estado    |
| ----- | ----- | ------ | ------------------------------------------- | --------------------------------- | --------------------------- | ---- | --------- | --------- |
| RF-30 | HU-35 | S4     | `POST /api/v1/purchase-orders`              | `supplier_order`, `_item`         | `purchases.e2e-spec.ts`     | E    | Must      | PENDIENTE |
| RF-31 | HU-36 | S4     | `PATCH /api/v1/purchase-orders/:id/send`    | `supplier_order.status`           | `purchases.service.spec.ts` | U    | Must      | PENDIENTE |
| RF-32 | HU-37 | S4     | `PATCH /api/v1/purchase-orders/:id/receive` | `product_stock`, `stock_movement` | `purchases.service.spec.ts` | U    | Must      | PENDIENTE |
| RF-33 | HU-38 | S4     | `PATCH /api/v1/purchase-orders/:id/cancel`  | `supplier_order.status`           | `purchases.service.spec.ts` | U    | Must      | PENDIENTE |
| RF-34 | HU-39 | S4     | `GET /api/v1/purchase-orders`               | `supplier_order`                  | `purchases.e2e-spec.ts`     | E    | Must      | PENDIENTE |
| RF-35 | HU-40 | S4     | `GET /api/v1/purchase-orders/suggestions`   | `product`, `product_stock`        | `purchases.service.spec.ts` | U    | Must      | PENDIENTE |

## 7. Clientes y crédito

| RF    | HU    | Sprint | Endpoint                                     | Entidad                 | Prueba                      | Tipo | Prioridad | Estado    |
| ----- | ----- | ------ | -------------------------------------------- | ----------------------- | --------------------------- | ---- | --------- | --------- |
| RF-36 | HU-41 | S5     | `POST/GET/PATCH /api/v1/customers`           | `customer`              | `customers.e2e-spec.ts`     | E    | Must      | PENDIENTE |
| RF-37 | HU-42 | S5     | `POST /api/v1/sales` (`CREDIT`)              | `customer_transaction`  | `customers.service.spec.ts` | U    | Must      | PENDIENTE |
| RF-38 | HU-43 | S5     | `POST /api/v1/sales` → 409                   | `customer.credit_limit` | `customers.service.spec.ts` | U    | Must      | PENDIENTE |
| RF-39 | HU-44 | S5     | `POST /api/v1/customers/:id/payments`        | `customer_transaction`  | `customers.e2e-spec.ts`     | E    | Must      | PENDIENTE |
| RF-40 | HU-45 | S5     | `GET /api/v1/customers/:id/statement`        | `customer_transaction`  | `customers.service.spec.ts` | U    | Must      | PENDIENTE |
| RF-41 | HU-46 | S5     | `GET /api/v1/customers/debtors`              | `customer_transaction`  | `customers.e2e-spec.ts`     | E    | Must      | PENDIENTE |
| RF-42 | HU-46 | S5     | `GET /api/v1/customers/debtors?overdue=true` | `sale.created_at`       | `customers.service.spec.ts` | U    | Should    | PENDIENTE |

## 8. Reportes y cortes

| RF    | HU    | Sprint | Endpoint                              | Entidad                      | Prueba                    | Tipo | Prioridad | Estado    |
| ----- | ----- | ------ | ------------------------------------- | ---------------------------- | ------------------------- | ---- | --------- | --------- |
| RF-43 | HU-47 | S6     | `GET /api/v1/reports/dashboard`       | múltiples                    | `reports.e2e-spec.ts`     | E    | Must      | PENDIENTE |
| RF-44 | HU-48 | S6     | `GET /api/v1/reports/sales`           | `sale`                       | `reports.service.spec.ts` | U    | Must      | PENDIENTE |
| RF-45 | HU-49 | S6     | `GET /api/v1/reports/top-products`    | `sale_item`                  | `reports.service.spec.ts` | U    | Must      | PENDIENTE |
| RF-46 | HU-50 | S6     | `GET /api/v1/reports/rotation`        | `sale_item`, `product_stock` | `reports.service.spec.ts` | U    | Must      | PENDIENTE |
| RF-47 | HU-51 | S6     | `GET /api/v1/reports/margins`         | `sale_item.cost_price`       | `reports.service.spec.ts` | U    | Must      | PENDIENTE |
| RF-50 | HU-52 | S6     | `GET /api/v1/reports/cash-closure`    | `cash_shift`, `sale`         | `reports.e2e-spec.ts`     | E    | Must      | PENDIENTE |
| RF-48 | —     | S6     | `GET /api/v1/reports/inventory-value` | `product_stock`              | `reports.service.spec.ts` | U    | Should    | PENDIENTE |
| RF-49 | —     | S6     | `?format=csv` en todos los reportes   | —                            | `reports.csv.spec.ts`     | U    | Should    | PENDIENTE |

## 9. Requerimientos No Funcionales

| RNF                                | Verificación                                                 | Sprint | Evidencia                                        | Estado       |
| ---------------------------------- | ------------------------------------------------------------ | ------ | ------------------------------------------------ | ------------ |
| RNF-01 Rendimiento API < 500 ms    | Prueba de carga con `k6` o autocannon                        | S6     | `perf/api-load.md`                               | PENDIENTE    |
| RNF-02 POS carga < 1.5 s (P95)     | Medición en dispositivo real                                 | S3     | UAT Sprint 3                                     | PENDIENTE    |
| RNF-03 Stock nunca negativo        | `inventory.concurrency.spec.ts` + `CHECK` en BD              | S2     | Informe de pruebas                               | PENDIENTE    |
| RNF-04 Trazabilidad de stock       | `stock_movement` append-only; aserción en cada test de stock | S2     | Informe de pruebas                               | PENDIENTE    |
| RNF-05 bcrypt 12 rondas            | Inspección de `user.password_hash`                           | S0     | `auth.service.spec.ts` (8 casos)                 | IMPLEMENTADO |
| RNF-06 Validación en dos capas     | Test que envía cuerpo inválido y espera 400                  | S0     | `auth.e2e-spec.ts`                               | IMPLEMENTADO |
| RNF-07 Venta en ≤ 3 interacciones  | Cronometraje con el cajero                                   | S3     | Checklist UAT 15                                 | PENDIENTE    |
| RNF-08 Cobertura ≥ 70 %            | `pnpm test:cov` en CI                                        | S0     | 84.86 % de líneas                                | IMPLEMENTADO |
| RNF-09 Despliegue en un comando    | `docker compose up --build`                                  | S0     | `docker-compose.prod.yml` + guía 11              | IMPLEMENTADO |
| RNF-10 Health checks y reinicio    | `docker inspect` del estado de salud                         | S0     | `docker-compose.prod.yml`                        | IMPLEMENTADO |
| RNF-11 Auditoría de operaciones    | Assert de `user_id` en cada prueba de stock y venta          | S2     | Pendiente: auditoría en módulos de stock y venta | PENDIENTE    |
| RNF-12 Contraste AA                | Revisión de la paleta del tema                               | S6     | `theme.ts`                                       | PENDIENTE    |
| RNF-13 Formatos MXN y `dd/mm/aaaa` | `format.test.ts`                                             | S1     | Pruebas unitarias                                | PENDIENTE    |
| RNF-14 Navegadores modernos        | Matriz de prueba manual                                      | S7     | Checklist UAT 15                                 | PENDIENTE    |
| RNF-15 Interfaz en español         | Revisión de cadena en CI                                     | S0     | `LoginView`, `DashboardView`, `AppLayout`        | IMPLEMENTADO |
| RNF-16 Backup verificado           | `pg_dump` y restauración probada                             | S7     | `docs/11-guia-despliegue.md`                     | PENDIENTE    |

## 10. Reglas de negocio y su verificación

| Regla                                         | Origen        | Verificación                                                          | Estado    |
| --------------------------------------------- | ------------- | --------------------------------------------------------------------- | --------- |
| RN-1 Stock por sucursal                       | RF-14         | `product_stock.uq` + pruebas por sucursal                             | PENDIENTE |
| RN-2 Stock nunca negativo                     | RF-20, RNF-03 | `CHECK` en BD + prueba de concurrencia                                | PENDIENTE |
| RN-3 Toda variación pasa por `stock_movement` | RNF-04        | Aserción: ningún service actualiza `quantity` sin insertar movimiento | PENDIENTE |
| RN-4 Venta atómica con descuento de stock     | RF-24         | Prueba de fallo a mitad de transacción y `ROLLBACK`                   | PENDIENTE |
| RN-5 Recepción suma stock en una transacción  | RF-32         | Prueba de fallo y `ROLLBACK`                                          | PENDIENTE |
| RN-6 Saldo derivado, no almacenado            | RF-40         | No existe columna `balance`; prueba de suma de transacciones          | PENDIENTE |
| RN-7 Total derivado de renglones              | RF-22         | `ck_sale_totals` en BD                                                | PENDIENTE |
| RN-8 Borrado lógico con historial             | RF-12         | Prueba: producto con ventas no se elimina                             | PENDIENTE |
| RN-9 Folio consecutivo no reutilizable        | RF-27         | Prueba de dos ventas concurrentes en la misma sucursal                | PENDIENTE |
| RN-10 Solo `ADMIN` anula y cierra             | RF-02, RF-28  | Prueba de `403` con rol `CASHIER`                                     | PENDIENTE |

## 11. Cobertura por Sprint

| Sprint    | RF     | RNF    | HU     | Puntos  |
| --------- | ------ | ------ | ------ | ------- |
| S0        | 6      | 5      | 12     | 34      |
| S1        | 7      | 1      | 7      | 24      |
| S2        | 7      | 3      | 7      | 31      |
| S3        | 9      | 2      | 8      | 34      |
| S4        | 6      | 0      | 6      | 19      |
| S5        | 7      | 0      | 6      | 21      |
| S6        | 8      | 3      | 7      | 22      |
| S7        | 0      | 2      | 3      | 13      |
| **Total** | **50** | **16** | **56** | **198** |

## 12. Estado Global

| Métrica                               | Valor                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Requerimientos funcionales totales    | 51                                                                                                           |
| Requerimientos no funcionales totales | 16                                                                                                           |
| Reglas de negocio                     | 10                                                                                                           |
| Historias de usuario                  | 56                                                                                                           |
| Puntos estimados                      | 198                                                                                                          |
| Sprints                               | 8 (S0 – S7)                                                                                                  |
| Entidades de base de datos            | 14 (más 8 enums y 19 restricciones CHECK)                                                                    |
| Módulos de backend                    | 12 carpetas (6 implementados: auth, health, branches, categories, suppliers, products · 6 con entidad lista) |
| Módulos de frontend                   | 5 (auth, dashboard, categories, suppliers, productos) + layout + design system                               |
| Pruebas automatizadas                 | 332 (133 unitarias backend, 172 e2e backend, 27 frontend)                                                    |
| Cobertura de líneas del backend       | 76.75 % (unitaria, `pnpm test:cov`)                                                                          |
| Requerimientos implementados          | 26 de 77                                                                                                     |
| **Avance del MVP**                    | **29 % (58 de 198 puntos)**                                                                                  |

---

## 13. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                                                            |
| ------- | ----------- | ---------------- | ---------------------------------------------------------------------- |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento                                         |
| 1.1.0   | 25 sep 2026 | Equipo StoreCore | Cierre del Sprint 0: estado real, verificación y desviaciones de stack |
