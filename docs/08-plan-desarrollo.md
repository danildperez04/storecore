# Plan de Desarrollo — StoreCore

**Versión:** 1.0.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

---

## 1. Horizonte del proyecto

| Parámetro              | Valor                                   |
| ---------------------- | --------------------------------------- |
| Sprints                | 8 (Sprint 0 a Sprint 7)                 |
| Duración de sprint     | 2 semanas                               |
| Duración total         | 16 semanas / 4 meses calendario         |
| Equipo                 | 1 desarrollador + Product Owner (dueño) |
| Entregable del MVP     | `v0.7.0` al cierre del Sprint 6         |
| Primer release estable | `v1.0.0` al cierre del Sprint 7         |

## 2. Hitos

```text
   Sprint 0        Sprint 1        Sprint 2        Sprint 3
  25 sep - 8 oct  9 - 22 oct    23 oct - 5 nov   6 - 19 nov
  ─────────────►  ─────────────►  ─────────────►  ─────────────►
  v0.1.0          v0.2.0          v0.3.0          v0.4.0
  Cimientos       Catálogo        Inventario       PUNTO DE VENTA
                                                          ╔═══════╗
  ═══════════════════════════════════════ MVP ENVIABLE ══╣ HITO 1╠══
                                                          ╚═══════╝
   Sprint 4        Sprint 5        Sprint 6        Sprint 7
  20 nov - 3 dic   4 - 17 dic     18 dic - 7 ene   8 - 21 ene
  ─────────────►  ─────────────►  ─────────────►  ─────────────►
  v0.5.0          v0.6.0          v0.7.0          v1.0.0
  Compras         Crédito         Reportes        UAT + RELEASE
                                                    ╔═══════╗
  ══════════════════════════════ MVP COMPLETO ══════╣ HITO 2╠══
                                                    ╚═══════╝
```

| Hito       | Fecha       | Significado                                                            |
| ---------- | ----------- | ---------------------------------------------------------------------- |
| **Hito 0** | 8 oct 2026  | El sistema levanta con Docker y un usuario puede entrar                |
| **Hito 1** | 19 nov 2026 | **El sistema es vendible.** Ya se puede cobrar y cerrar caja de verdad |
| **Hito 2** | 7 ene 2027  | **MVP completo.** Los seis módulos funcionan                           |
| **Hito 3** | 21 ene 2027 | **Release estable `v1.0.0`** tras UAT                                  |

> El Hito 1 es la red de seguridad del proyecto. A partir de ahí, aunque el resto se
> atrase, el dueño tiene una herramienta que ya le sirve. Eso reduce la presión y
> permite recortar alcance sin daño.

## 3. Sprint 0 — Cimientos e infraestructura

**Fechas:** 25 sep – 8 oct 2026 · **Versión:** `v0.1.0` · **Historias:** HU-01 a HU-12

### 3.1 Objetivo

Un sistema que levanta completo con un comando y en el que un usuario puede iniciar
sesión. Sin reglas de negocio todavía.

### 3.2 Tareas

| #   | Tarea                                                                       | HU           | Resultado                                 |
| --- | --------------------------------------------------------------------------- | ------------ | ----------------------------------------- |
| 1   | Crear el monorepo con pnpm workspaces                                       | HU-01        | `pnpm install` instala todo               |
| 2   | Estructura de `backend/` con NestJS 12                                      | HU-01        | `src/main.ts` responde                    |
| 3   | Estructura de `frontend/` con Vite 8 + React 19                             | HU-01        | Build de producción correcto              |
| 4   | `Dockerfile` multi-stage del backend                                        | HU-02        | Imagen de producción sin devDependencies  |
| 5   | `Dockerfile` multi-stage del frontend + `nginx.conf`                        | HU-02        | Se sirve el build con Nginx               |
| 6   | `docker-compose.yml` con los tres servicios y health checks                 | HU-02        | `up --build` levanta todo                 |
| 7   | `docker-compose.prod.yml` con volúmenes y reinicio                          | HU-02        | Preparado para producción                 |
| 8   | Módulo de configuración con validación de variables                         | HU-01        | Falla al arrancar si falta un `.env`      |
| 9   | Entidad `Branch` y CRUD                                                     | HU-11        | Se crean sucursales                       |
| 10  | Entidad `User` con rol y sucursal                                           | HU-10        | —                                         |
| 11  | `POST /api/v1/auth/login` con JWT y bcrypt 12 rondas                        | HU-07        | Devuelve token y datos del usuario        |
| 12  | `JwtAuthGuard` global con decorador `@Public()`                             | HU-07        | Rutas protegidas                          |
| 13  | `RolesGuard` con decorador `@Roles()`                                       | HU-09        | Un `CASHIER` recibe 403 en rutas de admin |
| 14  | CRUD de usuarios y sucursales                                               | HU-10, HU-11 | —                                         |
| 15  | `PATCH /api/v1/auth/password`                                               | HU-12        | —                                         |
| 16  | Registro de `last_login_at`                                                 | RF-06        | Auditoría de acceso                       |
| 17  | Módulo `health` con verificación de base de datos                           | HU-05        | `/api/v1/health`                          |
| 18  | `LoggerMiddleware`                                                          | HU-01        | Log de peticiones con duración            |
| 19  | Migración inicial: 8 enums + 14 tablas                                      | HU-01        | Esquema completo desde el día uno         |
| 20  | Seeder: 3 sucursales, 2 usuarios, 8 categorías, 5 proveedores, 50 productos | HU-06        | Datos de prueba creíbles                  |
| 21  | ESLint + Prettier + commitlint + Husky                                      | HU-04        | Convención aplicada automáticamente       |
| 22  | Pipeline de CI con servicio PostgreSQL                                      | HU-03        | `lint`, `build`, `test` en cada PR        |
| 23  | Vitest configurado en el frontend                                           | HU-03        | —                                         |
| 24  | Pruebas de auth y roles                                                     | HU-07, HU-09 | —                                         |

### 3.3 Criterios de aceptación

- [ ] `docker compose up --build` levanta los tres servicios en menos de 3 minutos
- [ ] `GET /api/v1/health` devuelve `{ status: "ok", database: "connected" }`
- [ ] `POST /api/v1/auth/login` con credenciales válidas devuelve un JWT
- [ ] La misma llamada con credenciales inválidas devuelve 401
- [ ] Un `CASHIER` recibe 403 en `GET /api/v1/users`
- [ ] La migración se aplica desde cero sobre una base vacía
- [ ] El seeder es idempotente: se puede correr dos veces sin duplicar
- [ ] CI en verde

## 4. Sprint 1 — Catálogo maestro

**Fechas:** 9 – 22 oct 2026 · **Versión:** `v0.2.0` · **Historias:** HU-13 a HU-19

### 4.1 Objetivo

El dueño carga su inventario real en el sistema.

### 4.2 Tareas

| #   | Tarea                                                        | HU           |
| --- | ------------------------------------------------------------ | ------------ |
| 1   | CRUD de `Category` con jerarquía; validar que no haya ciclos | HU-13        |
| 2   | CRUD de `Supplier`                                           | HU-14        |
| 3   | Entidad `Product` y `ProductStock`; validación de precios    | HU-15        |
| 4   | `POST /api/v1/products` con stock inicial por sucursal       | HU-15, HU-19 |
| 5   | `PATCH` y borrado lógico de productos                        | HU-16        |
| 6   | Búsqueda por nombre, SKU y código de barras                  | HU-17        |
| 7   | Filtros por categoría, proveedor y estado, con paginación    | HU-18        |
| 8   | Vista de catálogo con `DataGrid`, búsqueda y filtros         | HU-17, HU-18 |
| 9   | Formulario de producto con validación `zod`                  | HU-15        |
| 10  | Utilidades de formato de moneda y fecha (MXN, `dd/mm/aaaa`)  | RNF-13       |
| 11  | Endpoint de autocompletado para el POS                       | HU-17        |
| 12  | Pruebas de catálogo y búsqueda                               | —            |

### 4.3 Criterios de aceptación

- [ ] El dueño carga 50 productos reales sin ayuda técnica
- [ ] Un producto se encuentra por nombre parcial, por SKU y por código de barras
- [ ] El filtro por categoría reduce la lista correctamente
- [ ] El precio de venta menor al de compra se rechaza con mensaje claro
- [ ] Desactivar un producto con ventas lo oculta del catálogo sin romper el histórico
- [ ] El formato de moneda muestra `$1,234.50`

## 5. Sprint 2 — Inventario y alertas

**Fechas:** 23 oct – 5 nov 2026 · **Versión:** `v0.3.0` · **Historias:** HU-20 a HU-26

### 5.1 Objetivo

El stock se controla con trazabilidad y avisa antes de agotarse.

### 5.2 Tareas

| #   | Tarea                                                                      | HU                  |
| --- | -------------------------------------------------------------------------- | ------------------- |
| 1   | Módulo `inventory` con movimientos de los 6 tipos                          | HU-21, HU-22, HU-23 |
| 2   | `POST /api/v1/inventory/movements` con tipo, cantidad, motivo y referencia | HU-21               |
| 3   | Validación transaccional con `SELECT ... FOR UPDATE` sobre `product_stock` | HU-26               |
| 4   | Registro obligatorio de `previous_quantity` y `new_quantity`               | RNF-04              |
| 5   | `GET /api/v1/inventory/low-stock` con consulta de §6.1 del esquema         | HU-24               |
| 6   | Endpoint de kardex por producto                                            | HU-25               |
| 7   | Vista de inventario con stock por sucursal                                 | HU-20               |
| 8   | Vista de alertas con productos bajo mínimo                                 | HU-24               |
| 9   | Vista de kardex por producto                                               | HU-25               |
| 10  | Diálogo de ajuste de stock con motivo obligatorio                          | HU-22               |
| 11  | Prueba de concurrencia: dos ventas simultáneas sobre el mismo producto     | HU-26               |
| 12  | Prueba de `ROLLBACK` ante fallo a mitad de la transacción                  | RNF-03              |

### 5.3 Criterios de aceptación

- [ ] Registrar una entrada suma stock y aparece en el kardex
- [ ] Un ajuste con diferencia negativa descuenta la cantidad correcta
- [ ] Una merma descuenta stock y queda registrada con su motivo
- [ ] Un producto que baja del mínimo aparece en la lista de alertas
- [ ] El kardex explica cada cambio de stock con usuario, fecha y motivo
- [ ] Una venta de más de lo disponible es rechazada
- [ ] Dos operaciones concurrentes no dejan el stock en negativo (prueba verde)

## 6. Sprint 3 — Punto de venta

**Fechas:** 6 – 19 nov 2026 · **Versión:** `v0.4.0` · **Historias:** HU-27 a HU-34

### 6.1 Objetivo

Se puede cobrar una venta y cerrar la caja de punta a punta. **Este es el hito 1.**

### 6.2 Tareas

| #   | Tarea                                                                                  | HU           |
| --- | -------------------------------------------------------------------------------------- | ------------ |
| 1   | Store del carrito con `Zustand`                                                        | HU-28        |
| 2   | Pantalla POS: grid de productos, búsqueda, foco automático                             | HU-27, HU-28 |
| 3   | Captura por código de barras                                                           | HU-27        |
| 4   | Carrito lateral con cantidad editable, eliminación y totales en vivo                   | HU-28        |
| 5   | Aplicación de descuento por monto o porcentaje                                         | HU-29        |
| 6   | `POST /api/v1/sales` en transacción única: venta, renglones, stock, movimientos, folio | HU-30, HU-31 |
| 7   | Secuencia de folio por sucursal con `FOR UPDATE`                                       | HU-32        |
| 8   | Cálculo de cambio en pago en efectivo                                                  | HU-31        |
| 9   | Componente de ticket e impresión                                                       | HU-32        |
| 10  | `PATCH /api/v1/sales/:id/cancel` que devuelve el stock                                 | HU-33        |
| 11  | Módulo `cash`: apertura, cierre, arqueo y diferencia                                   | HU-34        |
| 12  | Pantalla de apertura y cierre de caja                                                  | HU-34        |
| 13  | Listado de ventas con filtro por fecha y sucursal                                      | —            |
| 14  | Pruebas de venta, anulación y cierre                                                   | —            |
| 15  | Medición de usabilidad: ¿la venta cabe en 3 interacciones?                             | RNF-07       |

### 6.3 Criterios de aceptación

- [ ] El cajero registra 20 ventas de prueba sin errores
- [ ] El stock baja exactamente en la cantidad vendida
- [ ] El folio es consecutivo y no se repite, incluso con dos cajeros a la vez
- [ ] El ticket impreso coincide con la venta registrada
- [ ] Una venta a crédito queda con el cliente asignado
- [ ] Una venta sin stock suficiente se rechaza con mensaje claro
- [ ] Una venta anulada devuelve el stock y conserva el registro
- [ ] El cierre de caja cuadra con el efectivo contado (diferencia en 0)
- [ ] La venta se completa en 3 o menos interacciones (RNF-07)

## 7. Sprint 4 — Compras a proveedores

**Fechas:** 20 nov – 3 dic 2026 · **Versión:** `v0.5.0` · **Historias:** HU-35 a HU-40

### 7.1 Objetivo

El pedido al proveedor deja de ser un recuerdo y se convierte en un registro que
actualiza el stock al llegar la mercancía.

### 7.2 Tareas

| #   | Tarea                                                            | HU           |
| --- | ---------------------------------------------------------------- | ------------ |
| 1   | Módulo `purchases` con los 4 estados                             | HU-35        |
| 2   | Crear orden en `DRAFT` con renglones y cálculo de total          | HU-35        |
| 3   | Transición a `ORDERED` con marca de `ordered_at`                 | HU-36        |
| 4   | Recepción total o parcial en una sola transacción que suma stock | HU-37        |
| 5   | Actualización de `purchase_price` del producto al recibir        | HU-37        |
| 6   | Transición a `CANCELLED`                                         | HU-38        |
| 7   | Listado con filtros por proveedor, estado y periodo              | HU-39        |
| 8   | Sugerencias de reposición: stock frente al mínimo y rotación     | HU-40        |
| 9   | Vista de órdenes y vista de detalle con recepción                | HU-35, HU-37 |
| 10  | Pruebas de recepción parcial y de `ROLLBACK`                     | RNF-03       |

### 7.4 Criterios de aceptación

- [ ] Se crea una orden con sus productos y cantidades
- [ ] La orden transiciona de `DRAFT` a `ORDERED` a `RECEIVED`
- [ ] Al recibir, el stock sube exactamente la cantidad recibida
- [ ] La recepción parcial (pedidos 100, llegan 80) registra la diferencia
- [ ] Una orden cancelada no suma stock
- [ ] El estado de la orden es visible en la lista

## 8. Sprint 5 — Clientes y crédito

**Fechas:** 4 – 17 dic 2026 · **Versión:** `v0.6.0` · **Historias:** HU-41 a HU-46

### 8.1 Objetivo

El fiado deja de perderse. Cada adeudo tiene nombre, monto y fecha.

### 8.2 Tareas

| #   | Tarea                                                   | HU                  |
| --- | ------------------------------------------------------- | ------------------- |
| 1   | Módulo `customers`: CRUD de clientes                    | HU-41               |
| 2   | `customer_transaction` con `CHARGE` y `PAYMENT`         | HU-42, HU-44        |
| 3   | Venta a crédito en el POS con selección de cliente      | HU-42               |
| 4   | Validación de `credit_limit` antes de conceder crédito  | HU-43               |
| 5   | Endpoint de abono a cuenta                              | HU-44               |
| 6   | Estado de cuenta: cargos, abonos y saldo derivado       | HU-45               |
| 7   | Lista de deudores ordenada por saldo                    | HU-46               |
| 8   | Marcado de adeudo vencido a más de 30 días              | RF-42               |
| 9   | Vista de clientes, estado de cuenta y lista de deudores | HU-41, HU-45, HU-46 |
| 10  | Pruebas de límite de crédito y de abonos                | —                   |

### 8.3 Criterios de aceptación

- [ ] Se registra un cliente con su límite de crédito
- [ ] Una venta a crédito suma al saldo del cliente
- [ ] Un abono reduce el saldo
- [ ] Una venta que rebasa el límite se rechaza con 409
- [ ] El estado de cuenta muestra cargos, abonos y saldo
- [ ] La lista de deudores está ordenada de mayor a menor

## 9. Sprint 6 — Reportes y cortes de caja

**Fechas:** 18 dic 2026 – 7 ene 2027 · **Versión:** `v0.7.0` · **Historias:** HU-47 a HU-53

### 9.1 Objetivo

El dueño puede tomar decisiones con datos. **Este es el hito 2: fin del MVP.**

### 9.2 Tareas

| #   | Tarea                                                | HU            |
| --- | ---------------------------------------------------- | ------------- |
| 1   | Módulo `reports` con las consultas de §6 del esquema | HU-48 a HU-52 |
| 2   | Endpoint del dashboard con 5 indicadores             | HU-47         |
| 3   | Reporte de ventas por periodo agrupado por día       | HU-48         |
| 4   | Reporte de productos más vendidos                    | HU-49         |
| 5   | Reporte de rotación                                  | HU-50         |
| 6   | Reporte de márgenes de utilidad                      | HU-51         |
| 7   | Reporte de corte por método de pago                  | HU-52         |
| 8   | Reporte de inventario valorizado                     | RF-48         |
| 9   | Exportación a CSV                                    | RF-49         |
| 10  | Dashboard con tarjetas de indicadores y gráficos     | HU-47         |
| 11  | Pantallas de reporte con filtros de fecha y sucursal | HU-48 a HU-52 |
| 12  | Pulido de interfaz: estados de carga, vacío y error  | —             |
| 13  | Prueba de rendimiento de la API (RNF-01)             | RNF-01        |

### 9.3 Criterios de aceptación

- [ ] El dashboard muestra ventas del día, tickets, productos bajo mínimo, órdenes pendientes y adeudos
- [ ] Los seis reportes devuelven datos correctos para un periodo dado
- [ ] El reporte de márgenes usa el costo congelado en el momento de la venta
- [ ] Cualquier reporte se exporta a CSV
- [ ] La API responde en menos de 500 ms con el conjunto de datos de referencia
- [ ] El dueño usa el dashboard para decidir su siguiente pedido

## 10. Sprint 7 — UAT y estabilización

**Fechas:** 8 – 21 ene 2027 · **Versión:** `v1.0.0` · **Historias:** HU-54 a HU-56

### 10.1 Objetivo

Validar en la tienda, corregir lo que falle y liberar la primera versión estable.

### 10.2 Tareas

| #   | Tarea                                                           | HU            |
| --- | --------------------------------------------------------------- | ------------- |
| 1   | Despliegue en el VPS de pruebas con el procedimiento de la guía | —             |
| 2   | UAT con el dueño: la checklist completa                         | HU-54         |
| 3   | UAT con el cajero: prueba de venta real                         | HU-54         |
| 4   | Registro y clasificación de defectos                            | HU-55         |
| 5   | Corrección de defectos altos y críticos                         | HU-55         |
| 6   | Prueba en los navegadores Chrome, Edge, Firefox y Safari        | RNF-14        |
| 7   | Prueba de backup y restauración                                 | HU-56, RNF-16 |
| 8   | Prueba de restored: simular caída de internet                   | —             |
| 9   | Prueba de rendimiento real en la tablet de la tienda            | RNF-02        |
| 10  | Documentación final y README actualizado                        | —             |
| 11  | Checklist de release de versionado                              | —             |
| 12  | Etiquetado de `v1.0.0`                                          | —             |

### 10.3 Criterios de aceptación

- [ ] Checklist UAT completa con el dueño (documento 15)
- [ ] Cero defectos abiertos de severidad alta o crítica
- [ ] El sistema se probó con ventas reales durante al menos 3 días
- [ ] El backup se ejecutó y se restauró correctamente
- [ ] El sistema funciona en los cuatro navegadores
- [ ] Todas las historias `Must` están en `TERMINADO`
- [ ] La matriz de trazabilidad no tiene requisitosMust pendientes
- [ ] `v1.0.0` etiquetada y documentada

## 11. Dependencias entre sprints

```text
S0 ──────► S1 ──────► S2 ──────► S3 ──┬──► S4 ──┐
                                          └──► S5 ─┴──► S6 ──► S7
```

| Sprint | Depende de                                    | Sin eso no puede empezar                           |
| ------ | --------------------------------------------- | -------------------------------------------------- |
| S1     | S0                                            | Nada: las categorías y el CRUD no dependen de auth |
| S2     | S0 (auth), S1 (productos)                     | Un movimiento necesita un producto que exista      |
| S3     | S1 (catálogo), S2 (stock)                     | Vender requiere stock real y productos cargados    |
| S4     | S1 (proveedores, productos), S2 (movimientos) | Recibir necesita generar movimientos de stock      |
| S5     | S3 (ventas)                                   | El crédito se origina en una venta                 |
| S6     | S3 (ventas), S2 (stock), S4 (compras)         | Los reportes resume datos de los demás módulos     |
| S7     | Todos                                         | UAT valida el sistema completo                     |

**S4 y S5 son paralelizables** si el backlog está suficientemente dividido. Con un
solo desarrollador se ejecutan en serie.

## 12. Orden de ejecución dentro de un sprint

Cada sprint sigue la misma secuencia, que reduce el riesgo de arrastrar deuda técnica:

```text
 1. Refinamiento      Revisar historias con el Product Owner (30 min)
 2. Migración         Escribir la migración ANTES que la entidad que la usa
 3. Entidades         Definir entidades TypeORM
 4. Servicio          Lógica de negocio y transacciones
 5. Controller        Rutas HTTP con validación de DTO
 6. Pruebas backend   Unitarias y de integración
 7. Interfaz          Servicios HTTP, hooks, componentes
 8. Pruebas frontend  Componentes y lógica de UI
 9. Documentación     Actualizar docs/10 y docs/09
10. PR                Code review y merge a develop
```

Escribir la migración antes que la entidad es deliberado: obliga a pensar el esquema
antes de la lógica, y evita tener que refactorizar SQL cuando el modelo ya está en uso.

## 13. Actualizaciones

| Fecha       | Sprint | Cambio                    | Author           |
| ----------- | ------ | ------------------------- | ---------------- |
| 25 sep 2026 | S0     | Creación inicial del plan | Equipo StoreCore |

---

## 14. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                    |
| ------- | ----------- | ---------------- | ------------------------------ |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento |
