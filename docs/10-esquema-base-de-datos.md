# Esquema de Base de Datos — StoreCore

**Versión:** 1.0.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

Motor: **PostgreSQL 16** · ORM: **TypeORM 1.x** · Migraciones: **TypeORM migrations**

---

## 0. Convenciones de nombres

| Elemento                    | Convención                         | Ejemplo                          |
| --------------------------- | ---------------------------------- | -------------------------------- |
| Tabla                       | `snake_case`, inglés, **singular** | `supplier`, `sale_item`          |
| Columna                     | `snake_case`, inglés               | `created_at`, `is_active`        |
| Clave primaria              | `id` (serial)                      | `id`                             |
| Clave foránea               | `<tabla_singular>_id`              | `supplier_id`                    |
| Índice                      | `idx_<tabla>_<columnas>`           | `idx_sale_created_at`            |
| Restricción única           | `uq_<tabla>_<columnas>`            | `uq_product_barcode`             |
| Restricción de verificación | `ck_<tabla>_<regla>`               | `ck_product_prices`              |
| Enum en base                | `snake_case`, en MAYÚSCULAS        | `sale_status`, `payment_method`  |
| Propiedad en entidad        | `camelCase` (mapeada a la columna) | `createdAt` → `created_at`       |
| Archivo de entidad          | `kebab-case.entity.ts`             | `supplier-order.entity.ts`       |
| Migración                   | `<timestamp>-<PascalCase>.ts`      | `1789270000000-InitialSchema.ts` |

**Reglas invariables:**

1. Todo el esquema (nombres de tablas, columnas e índices) está **en inglés**.
2. La documentación, los comentarios y la interfaz de usuario están **en español**.
3. Todo monto es `numeric(12,2)`. **Nunca** `float` ni `double`: los errores de
   redondeo en dinero no son aceptables.
4. Toda tabla tiene `created_at` y `updated_at`.
5. Las entidades de negocio usan **borrado lógico** (`is_active`), no borrado físico.
6. `synchronize` está **desactivado** en todos los entornos. El esquema solo cambia por migración.

## 1. Diagrama de Entidades

```text
                          ┌──────────────┐
                          │   branch     │
                          │  (sucursal)  │
                          └──────┬───────┘
                                 │ 1
                    ┌────────────┼────────────┬─────────────┐
                    │ N          │ N          │ N           │ N
             ┌──────▼─────┐ ┌────▼─────┐ ┌─────▼──────┐ ┌────▼──────┐
             │    user    │ │  sale    │ │supplier_   │ │cash_shift │
             │  (empleado)│ │  (venta) │ │   order    │ │  (corte)  │
             └──┬──────┬──┘ └──┬─────┬──┘ └─────┬──────┘ └───────────┘
                │      │       │     │           │ 1
                │ 1    │ 1     │ 1   │ N         │ N
                │      │       │     │           │
        ┌───────▼──┐   │  ┌────▼─────▼──┐  ┌─────▼────────────┐
        │ customer │   │  │  sale_item  │  │supplier_order_item│
        │ (cliente)│   │  └─────────────┘  └─────┬────────────┘
        └────┬─────┘   │                         │ N
             │ 1       │                         │
             │ N       │                         │ N
    ┌────────▼───────┐ │                    ┌────▼─────┐
    │customer_       │ │                    │ product  │
    │ transaction    │ │                    └────┬─────┘
    └────────────────┘ │                         │ 1
                       │                         │ N
              ┌────────▼─────────────────────────▼─────┐
              │             product_stock               │
              │  (existencia por producto y sucursal)  │
              └────────┬────────────────────────┬───────┘
                       │ 1                      │ 1
                       │ N                      │ N
            ┌──────────▼────────┐    ┌──────────▼─────────┐
            │  stock_movement   │    │     category        │
            │  (kardex / libro  │    │  (con subcategoría)│
            │   mayor de stock) │    └────────────────────┘
            └───────────────────┘
                       ▲
                       │ N
              ┌────────┴────────┐        ┌──────────────┐
              │     supplier    │◄───────┤   product    │
              │  (proveedor)    │  N:1   │  (catálogo)  │
              └─────────────────┘        └──────────────┘
```

## 2. Resumen de entidades

| #   | Tabla                  | Entidad             | Descripción                         | Origen                |
| --- | ---------------------- | ------------------- | ----------------------------------- | --------------------- |
| 1   | `branch`               | Branch              | Sucursal / tienda                   | RF-04                 |
| 2   | `user`                 | User                | Usuario con rol y sucursal          | RF-03                 |
| 3   | `category`             | Category            | Categoría jerárquica de productos   | RF-07                 |
| 4   | `supplier`             | Supplier            | Proveedor                           | RF-08                 |
| 5   | `product`              | Product             | Producto del catálogo               | RF-09                 |
| 6   | `product_stock`        | ProductStock        | Existencia por producto y sucursal  | RF-14                 |
| 7   | `stock_movement`       | StockMovement       | Libro mayor de movimientos de stock | RF-15 a RF-19, RNF-04 |
| 8   | `supplier_order`       | SupplierOrder       | Orden de compra a proveedor         | RF-30                 |
| 9   | `supplier_order_item`  | SupplierOrderItem   | Renglón de la orden de compra       | RF-30                 |
| 10  | `sale`                 | Sale                | Venta (cabecera)                    | RF-25                 |
| 11  | `sale_item`            | SaleItem            | Renglón de la venta                 | RF-22                 |
| 12  | `customer`             | Customer            | Cliente con crédito                 | RF-36                 |
| 13  | `customer_transaction` | CustomerTransaction | Cargo o abono de un cliente         | RF-37, RF-39          |
| 14  | `cash_shift`           | CashShift           | Apertura y cierre de caja           | RF-29                 |

## 3. Tablas

### 3.1 `branch` — Sucursal

| Columna      | Tipo           | Restricciones              | Notas                |
| ------------ | -------------- | -------------------------- | -------------------- |
| `id`         | `serial`       | PK                         | —                    |
| `code`       | `varchar(10)`  | `NOT NULL`, `uq`           | Código corto, único  |
| `name`       | `varchar(120)` | `NOT NULL`                 | Nombre visible       |
| `address`    | `varchar(255)` | `NULL`                     | Dirección física     |
| `phone`      | `varchar(20)`  | `NULL`                     | Teléfono de contacto |
| `is_active`  | `boolean`      | `NOT NULL`, default `true` | Borrado lógico       |
| `created_at` | `timestamptz`  | `NOT NULL`                 | —                    |
| `updated_at` | `timestamptz`  | `NOT NULL`                 | —                    |

### 3.2 `user` — Usuario

| Columna         | Tipo           | Restricciones              | Notas                        |
| --------------- | -------------- | -------------------------- | ---------------------------- |
| `id`            | `serial`       | PK                         | —                            |
| `username`      | `varchar(50)`  | `NOT NULL`, `uq`           | Se usa para iniciar sesión   |
| `email`         | `varchar(120)` | `NOT NULL`, `uq`           | —                            |
| `password_hash` | `varchar(255)` | `NOT NULL`                 | bcrypt, 12 rondas (RNF-05)   |
| `full_name`     | `varchar(120)` | `NOT NULL`                 | Nombre legible               |
| `role`          | `user_role`    | `NOT NULL`                 | `ADMIN` \| `CASHIER` (RF-02) |
| `branch_id`     | `integer`      | `FK` → `branch.id`         | Sucursal asignada            |
| `is_active`     | `boolean`      | `NOT NULL`, default `true` | —                            |
| `last_login_at` | `timestamptz`  | `NULL`                     | Última sesión (RF-06)        |
| `created_at`    | `timestamptz`  | `NOT NULL`                 | —                            |
| `updated_at`    | `timestamptz`  | `NOT NULL`                 | —                            |

**Restricción de dominio:** un `CASHIER` debe tener `branch_id`; un `ADMIN` puede tenerlo nulo y ver todas las sucursales.

### 3.3 `category` — Categoría

| Columna      | Tipo           | Restricciones                | Notas                           |
| ------------ | -------------- | ---------------------------- | ------------------------------- |
| `id`         | `serial`       | PK                           | —                               |
| `name`       | `varchar(120)` | `NOT NULL`                   | —                               |
| `slug`       | `varchar(140)` | `NOT NULL`, `uq`             | URL / clave legible             |
| `parent_id`  | `integer`      | `FK` → `category.id`, `NULL` | Subcategoría (RF-07)            |
| `icon`       | `varchar(50)`  | `NULL`                       | Nombre del icono en la interfaz |
| `is_active`  | `boolean`      | `NOT NULL`, default `true`   | —                               |
| `created_at` | `timestamptz`  | `NOT NULL`                   | —                               |
| `updated_at` | `timestamptz`  | `NOT NULL`                   | —                               |

**Restricción de dominio:** una categoría no puede ser su propia ancestro (se valida en el servicio).

### 3.4 `supplier` — Proveedor

| Columna        | Tipo           | Restricciones              | Notas                                 |
| -------------- | -------------- | -------------------------- | ------------------------------------- |
| `id`           | `serial`       | PK                         | —                                     |
| `name`         | `varchar(150)` | `NOT NULL`                 | —                                     |
| `contact_name` | `varchar(120)` | `NULL`                     | Persona de contacto                   |
| `phone`        | `varchar(20)`  | `NULL`                     | —                                     |
| `email`        | `varchar(120)` | `NULL`                     | —                                     |
| `address`      | `varchar(255)` | `NULL`                     | —                                     |
| `notes`        | `text`         | `NULL`                     | Observaciones (días de entrega, etc.) |
| `is_active`    | `boolean`      | `NOT NULL`, default `true` | Borrado lógico (RN-8)                 |
| `created_at`   | `timestamptz`  | `NOT NULL`                 | —                                     |
| `updated_at`   | `timestamptz`  | `NOT NULL`                 | —                                     |

### 3.5 `product` — Producto

| Columna          | Tipo            | Restricciones                    | Notas                                |
| ---------------- | --------------- | -------------------------------- | ------------------------------------ |
| `id`             | `serial`        | PK                               | —                                    |
| `sku`            | `varchar(50)`   | `NOT NULL`, `uq`                 | Clave interna                        |
| `barcode`        | `varchar(50)`   | `NULL`, `uq`                     | Código de barras, escaneable (RF-21) |
| `name`           | `varchar(180)`  | `NOT NULL`                       | Nombre comercial                     |
| `description`    | `text`          | `NULL`                           | —                                    |
| `category_id`    | `integer`       | `FK` → `category.id`, `NOT NULL` | —                                    |
| `supplier_id`    | `integer`       | `FK` → `supplier.id`, `NULL`     | Proveedor habitual (RF-35)           |
| `unit`           | `product_unit`  | `NOT NULL`                       | `UNIT` \| `KG` \| `LT`               |
| `purchase_price` | `numeric(12,2)` | `NOT NULL`, `>= 0`               | Precio de compra                     |
| `sale_price`     | `numeric(12,2)` | `NOT NULL`, `> purchase_price`   | Precio de venta (RF-10)              |
| `min_stock`      | `numeric(12,3)` | `NOT NULL`, default `0`, `>= 0`  | Umbral de alerta (RF-18)             |
| `is_active`      | `boolean`       | `NOT NULL`, default `true`       | Borrado lógico (RF-12, RN-8)         |
| `created_at`     | `timestamptz`   | `NOT NULL`                       | —                                    |
| `updated_at`     | `timestamptz`   | `NOT NULL`                       | —                                    |

**Restricciones:**

- `ck_product_prices`: `sale_price > purchase_price` (RF-10).
- `ck_product_min_stock`: `min_stock >= 0`.
- Índice único **parcial** en `barcode` para permitir varios `NULL`:
  `CREATE UNIQUE INDEX uq_product_barcode ON product (barcode) WHERE barcode IS NOT NULL;`
- Índices de búsqueda: `idx_product_name` (trigram) y `idx_product_category_id`.

### 3.6 `product_stock` — Existencia por producto y sucursal

| Columna      | Tipo            | Restricciones                       | Notas               |
| ------------ | --------------- | ----------------------------------- | ------------------- |
| `id`         | `serial`        | PK                                  | —                   |
| `product_id` | `integer`       | `FK` → `product.id`, `NOT NULL`     | —                   |
| `branch_id`  | `integer`       | `FK` → `branch.id`, `NOT NULL`      | —                   |
| `quantity`   | `numeric(12,3)` | `NOT NULL`, default `0`, **`>= 0`** | Exist actual (RN-2) |
| `created_at` | `timestamptz`   | `NOT NULL`                          | —                   |
| `updated_at` | `timestamptz`   | `NOT NULL`                          | —                   |

**Restricciones:**

- `uq_product_stock_pair`: `UNIQUE (product_id, branch_id)` — una sola fila por combinación.
- `ck_product_stock_quantity`: `CHECK (quantity >= 0)` — **la base de datos es la última
  línea de defensa** contra el stock negativo (RN-2, RNF-03). Si esta restricción
  salta, hay un bug grave.
- Índices: `idx_product_stock_branch_id`, `idx_product_stock_low` sobre `(branch_id, quantity)`
  para localizar rápido los productos bajo mínimo.

> Esta fila es la que se bloquea con `SELECT ... FOR UPDATE` durante una venta o un
> ajuste, para serializar operaciones concurrentes sobre el mismo producto (RNF-03).

### 3.7 `stock_movement` — Libro mayor de movimientos

| Columna             | Tipo                  | Restricciones                   | Notas                                           |
| ------------------- | --------------------- | ------------------------------- | ----------------------------------------------- |
| `id`                | `serial`              | PK                              | —                                               |
| `product_id`        | `integer`             | `FK` → `product.id`, `NOT NULL` | —                                               |
| `branch_id`         | `integer`             | `FK` → `branch.id`, `NOT NULL`  | Sucursal donde ocurrió                          |
| `type`              | `stock_movement_type` | `NOT NULL`                      | Ver tabla de tipos                              |
| `quantity`          | `numeric(12,3)`       | `NOT NULL`                      | **Siempre positiva**; el signo lo define `type` |
| `reason`            | `varchar(255)`        | `NULL`                          | Motivo obligatorio en `ADJUSTMENT` y `WASTE`    |
| `reference`         | `varchar(100)`        | `NULL`                          | Folio de orden, ticket o nota                   |
| `previous_quantity` | `numeric(12,3)`       | `NOT NULL`                      | Stock antes del movimiento                      |
| `new_quantity`      | `numeric(12,3)`       | `NOT NULL`                      | Stock después del movimiento                    |
| `user_id`           | `integer`             | `FK` → `user.id`, `NOT NULL`    | Quién lo ejecutó (RF-06, RNF-11)                |
| `created_at`        | `timestamptz`         | `NOT NULL`                      | Fecha del movimiento                            |

**Tipos de movimiento y su efecto:**

| `type`       | Efecto en `quantity` | Cuándo se registra                            | Originado en |
| ------------ | -------------------- | --------------------------------------------- | ------------ |
| `PURCHASE`   | `+`                  | Recepción de orden de compra o entrada manual | RF-15, RF-32 |
| `SALE`       | `-`                  | Venta registrada                              | RF-25        |
| `RETURN`     | `+`                  | Anulación de venta (devuelve el stock)        | RF-28        |
| `ADJUSTMENT` | `+` o `-`            | Conteo físico con diferencia                  | RF-16        |
| `WASTE`      | `-`                  | Producto dañado, vencido o consumo interno    | RF-17        |
| `INITIAL`    | `+`                  | Carga inicial al crear el producto            | RF-13        |

> `quantity` siempre positiva y el signo lo determina el `type` hace que el kardex
> sea trivial de leer y que el total sea siempre la suma algebraica de los movimientos.

**Restricción:** `ck_stock_movement_quantity`: `CHECK (quantity > 0)` para los tipos
con signo fijo; `ADJUSTMENT` usa `quantity` positiva más el signo de la diferencia en
`new_quantity - previous_quantity`.

**Índices:** `idx_stock_movement_product_id`, `idx_stock_movement_created_at`,
`idx_stock_movement_branch_type` — este último alimenta el reporte de movimientos por periodo.

### 3.8 `supplier_order` — Orden de compra

| Columna        | Tipo                    | Restricciones                    | Notas                                  |
| -------------- | ----------------------- | -------------------------------- | -------------------------------------- |
| `id`           | `serial`                | PK                               | —                                      |
| `order_number` | `varchar(20)`           | `NOT NULL`, `uq`                 | Folio consecutivo por sucursal (RF-30) |
| `supplier_id`  | `integer`               | `FK` → `supplier.id`, `NOT NULL` | —                                      |
| `branch_id`    | `integer`               | `FK` → `branch.id`, `NOT NULL`   | Sucursal receptora                     |
| `status`       | `supplier_order_status` | `NOT NULL`, default `DRAFT`      | Ver estados                            |
| `ordered_at`   | `timestamptz`           | `NULL`                           | Cuándo se envió al proveedor (RF-31)   |
| `received_at`  | `timestamptz`           | `NULL`                           | Cuándo llegó la mercancía (RF-32)      |
| `subtotal`     | `numeric(12,2)`         | `NOT NULL`, default `0`          | Suma de renglones                      |
| `total`        | `numeric(12,2)`         | `NOT NULL`, default `0`          | Con impuesto aplicado si aplica        |
| `notes`        | `text`                  | `NULL`                           | Observaciones                          |
| `user_id`      | `integer`               | `FK` → `user.id`, `NOT NULL`     | Quién creó la orden                    |
| `created_at`   | `timestamptz`           | `NOT NULL`                       | —                                      |
| `updated_at`   | `timestamptz`           | `NOT NULL`                       | —                                      |

**Estados:**

| `status`    | Significado                           | Transición a            |
| ----------- | ------------------------------------- | ----------------------- |
| `DRAFT`     | En preparación, no enviada            | `ORDERED`, `CANCELLED`  |
| `ORDERED`   | Enviada al proveedor, en espera       | `RECEIVED`, `CANCELLED` |
| `RECEIVED`  | Mercancía recibida, stock actualizado | Terminal                |
| `CANCELLED` | Cancelada, no se recibirá             | Terminal                |

### 3.9 `supplier_order_item` — Renglón de orden de compra

| Columna             | Tipo            | Restricciones                                               | Notas                               |
| ------------------- | --------------- | ----------------------------------------------------------- | ----------------------------------- |
| `id`                | `serial`        | PK                                                          | —                                   |
| `order_id`          | `integer`       | `FK` → `supplier_order.id`, `NOT NULL`, `ON DELETE CASCADE` | —                                   |
| `product_id`        | `integer`       | `FK` → `product.id`, `NOT NULL`                             | —                                   |
| `quantity`          | `numeric(12,3)` | `NOT NULL`, `> 0`                                           | Cantidad pedida                     |
| `received_quantity` | `numeric(12,3)` | `NOT NULL`, default `0`, `>= 0`                             | Cantidad realmente recibida (RF-32) |
| `unit_cost`         | `numeric(12,2)` | `NOT NULL`, `>= 0`                                          | Costo unitario pactado              |
| `subtotal`          | `numeric(12,2)` | `NOT NULL`                                                  | `quantity * unit_cost`              |

> `received_quantity` separada de `quantity` permite **recepción parcial**: se pidió
> 100 y llegaron 80. La diferencia queda visible sin cancelar el renglón.

### 3.10 `sale` — Venta

| Columna               | Tipo             | Restricciones                   | Notas                                      |
| --------------------- | ---------------- | ------------------------------- | ------------------------------------------ |
| `id`                  | `serial`         | PK                              | —                                          |
| `sale_number`         | `varchar(20)`    | `NOT NULL`, `uq`                | Folio consecutivo por sucursal (RF-27)     |
| `branch_id`           | `integer`        | `FK` → `branch.id`, `NOT NULL`  | Sucursal que vende                         |
| `user_id`             | `integer`        | `FK` → `user.id`, `NOT NULL`    | Cajero (RF-06)                             |
| `customer_id`         | `integer`        | `FK` → `customer.id`, `NULL`    | Presente si la venta es a crédito (RF-37)  |
| `cash_shift_id`       | `integer`        | `FK` → `cash_shift.id`, `NULL`  | Caja abierta al momento de vender (RF-29)  |
| `status`              | `sale_status`    | `NOT NULL`, default `COMPLETED` | `COMPLETED` \| `CANCELLED`                 |
| `payment_method`      | `payment_method` | `NOT NULL`                      | `CASH` \| `CARD` \| `TRANSFER` \| `CREDIT` |
| `subtotal`            | `numeric(12,2)`  | `NOT NULL`, `>= 0`              | Suma de renglones sin descuento (RN-7)     |
| `discount`            | `numeric(12,2)`  | `NOT NULL`, default `0`, `>= 0` | Descuento aplicado (RF-23)                 |
| `total`               | `numeric(12,2)`  | `NOT NULL`, `>= 0`              | `subtotal - discount`                      |
| `amount_received`     | `numeric(12,2)`  | `NULL`                          | Efectivo entregado (para calcular cambio)  |
| `change_given`        | `numeric(12,2)`  | `NULL`                          | Cambio devuelto                            |
| `cancelled_at`        | `timestamptz`    | `NULL`                          | Cuándo se anuló (RF-28)                    |
| `cancelled_by_id`     | `integer`        | `FK` → `user.id`, `NULL`        | Quién anuló                                |
| `cancellation_reason` | `varchar(255)`   | `NULL`                          | Motivo de la anulación                     |
| `created_at`          | `timestamptz`    | `NOT NULL`                      | Fecha de la venta                          |

**Restricciones:**

- `uq_sale_number_branch`: `UNIQUE (branch_id, sale_number)` — el folio es único **por sucursal** (RF-27).
- `ck_sale_totals`: `CHECK (total = subtotal - discount)`.
- Índice: `idx_sale_created_at`, `idx_sale_branch_status`, `idx_sale_customer_id`.

### 3.11 `sale_item` — Renglón de venta

| Columna      | Tipo            | Restricciones                                     | Notas                                                  |
| ------------ | --------------- | ------------------------------------------------- | ------------------------------------------------------ |
| `id`         | `serial`        | PK                                                | —                                                      |
| `sale_id`    | `integer`       | `FK` → `sale.id`, `NOT NULL`, `ON DELETE CASCADE` | —                                                      |
| `product_id` | `integer`       | `FK` → `product.id`, `NOT NULL`                   | —                                                      |
| `quantity`   | `numeric(12,3)` | `NOT NULL`, `> 0`                                 | Cantidad vendida                                       |
| `unit_price` | `numeric(12,2)` | `NOT NULL`, `>= 0`                                | **Precio congelado al momento de la venta**            |
| `discount`   | `numeric(12,2)` | `NOT NULL`, default `0`, `>= 0`                   | Descuento del renglón                                  |
| `subtotal`   | `numeric(12,2)` | `NOT NULL`                                        | `quantity * unit_price - discount`                     |
| `cost_price` | `numeric(12,2)` | `NOT NULL`                                        | **Costo congelado**, para calcular margen real (RF-47) |

> `unit_price` y `cost_price` se copian al renglón en el momento de la venta. Si
> mañana sube el precio del producto, las ventas de hoy deben seguir reportando
> el margen que realmente se obtuvo. Sin este congelamiento, los reportes históricos
> se reescriben solos y dejan de ser confiables.

### 3.12 `customer` — Cliente

| Columna        | Tipo            | Restricciones                   | Notas                              |
| -------------- | --------------- | ------------------------------- | ---------------------------------- |
| `id`           | `serial`        | PK                              | —                                  |
| `name`         | `varchar(150)`  | `NOT NULL`                      | —                                  |
| `phone`        | `varchar(20)`   | `NULL`                          | Identificador informal del cliente |
| `address`      | `varchar(255)`  | `NULL`                          | —                                  |
| `credit_limit` | `numeric(12,2)` | `NOT NULL`, default `0`, `>= 0` | Límite de fiado (RF-38)            |
| `notes`        | `text`          | `NULL`                          | —                                  |
| `is_active`    | `boolean`       | `NOT NULL`, default `true`      | —                                  |
| `created_at`   | `timestamptz`   | `NOT NULL`                      | —                                  |
| `updated_at`   | `timestamptz`   | `NOT NULL`                      | —                                  |

> `balance` **no** se almacena en esta tabla: se deriva sumando
> `customer_transaction`. Es intencional (RN-6). Una columna de balance es una
> fuente de descuadres; la vista o consulta que lo suma nunca se desincroniza.

### 3.13 `customer_transaction` — Cargo o abono

| Columna       | Tipo                        | Restricciones                    | Notas                     |
| ------------- | --------------------------- | -------------------------------- | ------------------------- |
| `id`          | `serial`                    | PK                               | —                         |
| `customer_id` | `integer`                   | `FK` → `customer.id`, `NOT NULL` | —                         |
| `type`        | `customer_transaction_type` | `NOT NULL`                       | `CHARGE` \| `PAYMENT`     |
| `amount`      | `numeric(12,2)`             | `NOT NULL`, `> 0`                | Monto, siempre positivo   |
| `sale_id`     | `integer`                   | `FK` → `sale.id`, `NULL`         | Presente en `CHARGE`      |
| `user_id`     | `integer`                   | `FK` → `user.id`, `NOT NULL`     | Quién lo registró (RF-39) |
| `notes`       | `varchar(255)`              | `NULL`                           | Concepto del abono        |
| `created_at`  | `timestamptz`               | `NOT NULL`                       | —                         |

**Saldo del cliente:**

```sql
SELECT
  c.id,
  c.name,
  COALESCE(SUM(CASE WHEN t.type = 'CHARGE'  THEN  t.amount
                    WHEN t.type = 'PAYMENT' THEN -t.amount END), 0) AS balance
FROM customer c
LEFT JOIN customer_transaction t ON t.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY balance DESC;
```

### 3.14 `cash_shift` — Apertura y cierre de caja

| Columna           | Tipo                | Restricciones                  | Notas                              |
| ----------------- | ------------------- | ------------------------------ | ---------------------------------- |
| `id`              | `serial`            | PK                             | —                                  |
| `branch_id`       | `integer`           | `FK` → `branch.id`, `NOT NULL` | Sucursal                           |
| `user_id`         | `integer`           | `FK` → `user.id`, `NOT NULL`   | Quién abrió la caja                |
| `status`          | `cash_shift_status` | `NOT NULL`                     | `OPEN` \| `CLOSED`                 |
| `opening_amount`  | `numeric(12,2)`     | `NOT NULL`, `>= 0`             | Efectivo con el que abre           |
| `closing_amount`  | `numeric(12,2)`     | `NULL`                         | Efectivo contado al cerrar         |
| `expected_amount` | `numeric(12,2)`     | `NULL`                         | Calculado por el sistema (RF-29)   |
| `difference`      | `numeric(12,2)`     | `NULL`                         | `closing_amount - expected_amount` |
| `sales_cash`      | `numeric(12,2)`     | `NOT NULL`, default `0`        | Total en efectivo del turno        |
| `sales_card`      | `numeric(12,2)`     | `NOT NULL`, default `0`        | Total en tarjeta                   |
| `sales_transfer`  | `numeric(12,2)`     | `NOT NULL`, default `0`        | Total en transferencia             |
| `sales_total`     | `numeric(12,2)`     | `NOT NULL`, default `0`        | Total del turno                    |
| `opened_at`       | `timestamptz`       | `NOT NULL`                     | —                                  |
| `closed_at`       | `timestamptz`       | `NULL`                         | —                                  |
| `notes`           | `text`              | `NULL`                         | Observaciones del cierre           |

**Cálculo del esperado al cerrar (RF-29):**

```text
expected_amount = opening_amount + sales_cash
difference      = closing_amount - expected_amount
```

> El efectivo esperado solo incluye ventas en efectivo. Las ventas con tarjeta,
> transferencia o crédito no entran en el arqueo de efectivo.

**Restricción de dominio:** solo puede existir **un** `cash_shift` abierto por
`branch_id`. Se garantiza con un índice único parcial:

```sql
CREATE UNIQUE INDEX uq_cash_shift_open
  ON cash_shift (branch_id) WHERE status = 'OPEN';
```

## 4. Enums

```sql
CREATE TYPE user_role              AS ENUM ('ADMIN', 'CASHIER');
CREATE TYPE product_unit           AS ENUM ('UNIT', 'KG', 'LT');
CREATE TYPE stock_movement_type    AS ENUM
  ('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'WASTE', 'INITIAL');
CREATE TYPE supplier_order_status  AS ENUM ('DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED');
CREATE TYPE sale_status            AS ENUM ('COMPLETED', 'CANCELLED');
CREATE TYPE payment_method         AS ENUM ('CASH', 'CARD', 'TRANSFER', 'CREDIT');
CREATE TYPE customer_transaction_type AS ENUM ('CHARGE', 'PAYMENT');
CREATE TYPE cash_shift_status      AS ENUM ('OPEN', 'CLOSED');
```

## 5. Relaciones y reglas de borrado

| Origen                             | Destino          | Comportamiento                                            |
| ---------------------------------- | ---------------- | --------------------------------------------------------- |
| `user.branch_id`                   | `branch`         | `RESTRICT` — no se puede borrar una sucursal con usuarios |
| `product.category_id`              | `category`       | `RESTRICT`                                                |
| `product.supplier_id`              | `supplier`       | `SET NULL` — el producto sobrevive al proveedor           |
| `product_stock.product_id`         | `product`        | `CASCADE`                                                 |
| `product_stock.branch_id`          | `branch`         | `CASCADE`                                                 |
| `stock_movement.product_id`        | `product`        | `RESTRICT` — el kardex es histórico                       |
| `supplier_order.supplier_id`       | `supplier`       | `RESTRICT`                                                |
| `supplier_order_item.order_id`     | `supplier_order` | `CASCADE`                                                 |
| `sale.branch_id`                   | `branch`         | `RESTRICT`                                                |
| `sale.user_id`                     | `user`           | `RESTRICT` — la venta conserva al cajero                  |
| `sale.customer_id`                 | `customer`       | `SET NULL`                                                |
| `sale_item.sale_id`                | `sale`           | `CASCADE`                                                 |
| `customer_transaction.customer_id` | `customer`       | `CASCADE`                                                 |

> Las ventas, los movimientos de stock y las transacciones de cliente **nunca** se
> borran en cascada desde su entidad principal. Son el registro contable del negocio.

## 6. Consultas críticas

### 6.1 Productos bajo el stock mínimo (RF-18)

```sql
SELECT
  p.id, p.sku, p.name, p.min_stock, ps.quantity, p.supplier_id, b.name AS branch
FROM product_stock ps
JOIN product p ON p.id = ps.product_id
JOIN branch  b ON b.id = ps.branch_id
WHERE p.is_active = true
  AND ps.quantity <= p.min_stock
ORDER BY (ps.quantity - p.min_stock) ASC;
```

### 6.2 Kardex de un producto (RF-19)

```sql
SELECT
  sm.created_at, sm.type, sm.quantity,
  sm.previous_quantity, sm.new_quantity,
  sm.reason, sm.reference, u.username
FROM stock_movement sm
JOIN user u ON u.id = sm.user_id
WHERE sm.product_id = $1 AND sm.branch_id = $2
ORDER BY sm.created_at DESC, sm.id DESC;
```

### 6.3 Ventas de un periodo (RF-44)

```sql
SELECT
  DATE(created_at) AS day,
  COUNT(*)         AS tickets,
  SUM(total)       AS sales,
  SUM(discount)    AS discounts
FROM sale
WHERE status = 'COMPLETED'
  AND branch_id = $1
  AND created_at BETWEEN $2 AND $3
GROUP BY DATE(created_at)
ORDER BY day;
```

### 6.4 Productos más vendidos (RF-45)

```sql
SELECT
  p.id, p.sku, p.name,
  SUM(si.quantity) AS units_sold,
  SUM(si.subtotal) AS revenue
FROM sale_item si
JOIN sale    s ON s.id = si.sale_id
JOIN product p ON p.id = si.product_id
WHERE s.status = 'COMPLETED' AND s.created_at BETWEEN $1 AND $2
GROUP BY p.id, p.sku, p.name
ORDER BY units_sold DESC;
```

### 6.5 Margen de utilidad (RF-47)

```sql
SELECT
  p.sku, p.name,
  SUM(si.subtotal)                  AS revenue,
  SUM(si.cost_price * si.quantity)  AS cost,
  SUM(si.subtotal) - SUM(si.cost_price * si.quantity) AS profit,
  ROUND(
    (SUM(si.subtotal) - SUM(si.cost_price * si.quantity))
    / NULLIF(SUM(si.subtotal), 0) * 100, 2
  ) AS margin_percent
FROM sale_item si
JOIN sale    s ON s.id = si.sale_id
JOIN product p ON p.id = si.product_id
WHERE s.status = 'COMPLETED' AND s.created_at BETWEEN $1 AND $2
GROUP BY p.sku, p.name
ORDER BY profit DESC;
```

### 6.6 Inventario valorizado (RF-48)

```sql
SELECT
  p.sku, p.name, ps.quantity, p.purchase_price,
  ROUND(ps.quantity * p.purchase_price, 2) AS value
FROM product_stock ps
JOIN product p ON p.id = ps.product_id
WHERE ps.branch_id = $1 AND p.is_active = true
ORDER BY value DESC;
```

### 6.7 Clientes con adeudo (RF-41)

Ver §3.13, consulta de saldo.

## 7. Migraciones

| #   | Archivo                                                | Contenido                                           | Sprint |
| --- | ------------------------------------------------------ | --------------------------------------------------- | ------ |
| 1   | `1789270000000-InitialSchema.ts`                       | Los 8 enums, las 14 tablas, índices y restricciones | S0     |
| 2   | `1789350000000-SeedCatalog.ts` _(datos, no migración)_ | Seeder con productos reales                         | S0     |

**Reglas para migraciones:**

1. Se nombran `<timestamp>-<PascalCase>.ts`, con el timestamp en milisegundos.
2. Cada migración implementa `up` y `down`.
3. Una migración editada después de aplicada en `main` **no se edita**: se agrega otra que corrige.
4. `synchronize: false` siempre. Nunca se "arregla" el esquema a mano con `ALTER TABLE` en producción.
5. Los datos iniciales van en `seeders/`, no en migraciones.

```bash
# Generar una migración tras cambiar entidades
pnpm --filter backend migration:generate -- src/database/migrations/AddFoo

# Aplicar migraciones
pnpm --filter backend migration:run

# Revertir la última
pnpm --filter backend migration:revert

# Cargar datos iniciales
pnpm --filter backend seed:run
```

## 8. Requerimientos no funcionales asociados

| RNF                         | Cómo lo garantiza el esquema                                               |
| --------------------------- | -------------------------------------------------------------------------- |
| RNF-03 Stock nunca negativo | `CHECK (quantity >= 0)` en `product_stock` + transacción con `FOR UPDATE`  |
| RNF-04 Trazabilidad         | `stock_movement` es append-only: no se actualiza ni se borra               |
| RNF-05 Seguridad            | `password_hash` con bcrypt 12 rondas; el schema nunca almacena texto plano |
| RNF-11 Auditoría            | `user_id` en toda tabla de operación sensible                              |
| RNF-13 Localización         | `numeric(12,2)` para montos, `timestamptz` para fechas                     |

---

## 9. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                    |
| ------- | ----------- | ---------------- | ------------------------------ |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento |
