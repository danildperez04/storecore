# AGENTS.md

Instrucciones para asistentes de código (Claude, Cursor, Copilot, opencode y similares)
que trabajen en este repositorio. **Léelas antes de escribir o modificar una línea.**

---

## 1. Contexto

StoreCore es un sistema de gestión para tiendas de abarrotes. Monorepo con dos
workspaces: `backend` (NestJS + TypeORM + PostgreSQL) y `frontend` (React + Vite).

| Dato                                               | Valor                                                       |
| -------------------------------------------------- | ----------------------------------------------------------- |
| Idioma de la documentación, comentarios e interfaz | Español                                                     |
| Idioma del código, identificadores y commits       | Inglés                                                      |
| Nombres de tablas y columnas en BD                 | Inglés, `snake_case`, singular                              |
| Propiedades de entidad en TypeScript               | `camelCase` mapeado a `snake_case`                          |
| Moneda                                             | MXN, `numeric(12,2)` en base de datos                       |
| Fechas                                             | `timestamptz` en base de datos, `dd/mm/aaaa` en la interfaz |

## 2. Documentos obligatorios

Antes de tocar una parte del sistema, lee el documento correspondiente:

| Voy a trabajar en…          | Debo leer                                                             |
| --------------------------- | --------------------------------------------------------------------- |
| Cualquier cosa              | `docs/14-arquitectura.md` y `docs/12-plan-pruebas.md`                 |
| Base de datos o migraciones | `docs/10-esquema-base-de-datos.md`                                    |
| Un módulo nuevo             | `docs/14-arquitectura.md` §2.3 y §2.4                                 |
| Inventario o ventas         | `docs/02-prd-mvp-moscow.md` §2 (reglas de negocio)                    |
| Reportes                    | `docs/10-esquema-base-de-datos.md` §6                                 |
| Despliegue o Docker         | `docs/11-guia-despliegue.md`                                          |
| Commits o ramas             | `docs/06-convencion-de-commits.md` y `docs/07-convencion-de-ramas.md` |

## 3. Reglas innegociables

Estas reglas no se negocian. Si una petición del usuario las contradice, **señálalo
antes de implementar**.

1. **El stock nunca queda negativo.** Cualquier operación que lo permita va contra
   `RNF-03` y `RN-2`. La base de datos tiene `CHECK (quantity >= 0)`.

2. **El stock solo cambia por `stock_movement`.** Nunca un `UPDATE` directo sobre
   `product_stock.quantity` sin insertar el movimiento correspondiente. Es `RN-3` y
   `RNF-04`.

3. **Toda operación con stock va dentro de una transacción**, con
   `SELECT ... FOR UPDATE` sobre `product_stock` antes de leer la cantidad. Sin el
   bloqueo, dos ventas concurrentes pueden dejar el stock en negativo.

4. **El folio consecutivo se reserva con `FOR UPDATE`**, nunca con
   `MAX(sale_number) + 1`. Con dos cajeros cobrando, `MAX` devuelve el mismo número
   a ambos.

5. **Nada se borra si tiene historial.** Productos, proveedores y clientes se
   desactivan con `is_active`. Ventas, movimientos de stock y transacciones de
   cliente jamás se borran.

6. **El saldo del cliente y el total de la venta son derivados.** No se agrega una
   columna para almacenarlos. Se calculan sumando.

7. **Los precios se congelan en el renglón de venta.** `unit_price` y `cost_price`
   se copian al vender, para que subir el precio de un producto no reescriba los
   márgenes históricos.

8. **El controller no tiene lógica de negocio.** Si hay un `if` de negocio en un
   controller, esa lógica va al service.

9. **La autorización es del servidor.** Ocultar un botón en la interfaz es
   conveniencia, no seguridad. Cada endpoint valida el rol.

10. **El esquema solo cambia por migración.** `synchronize` es `false` en todos los
    entornos. Una migración ya aplicada en `main` no se edita: se agrega otra.

## 4. Flujo de trabajo

```text
1. Lee la documentación relevante (§2)
2. Confirma la trazabilidad: ¿qué RF y qué HU implementa este cambio?
3. Si toca el esquema, escribe la MIGRACIÓN antes que la entidad
4. Escribe el service con la lógica y la transacción
5. Escribe el controller delgado
6. Escribe las pruebas: primero la del caso crítico
7. Verifica: pnpm lint && pnpm typecheck && pnpm test
8. Actualiza docs/09-matriz-trazabilidad.md y docs/10 si aplica
9. Commit con Conventional Commits referenciando HU y RF
```

## 5. Convenciones de código

### TypeScript

- Comillas simples, punto y coma, 2 espacios, 100 columnas
- `interface` sobre `type` cuando no se necesita unión
- `unknown` sobre `any`. Si de verdad hace falta `any`, justifícalo con un comentario
- El prefijo `_` marca parámetros intencionalmente no usados
- Sin `console.log` en código que se entrega

### Backend (NestJS)

```text
src/
├── main.ts                 Bootstrap. Sin lógica de negocio.
├── app.module.ts           Módulo raíz
├── config/                 Configuración validada
├── common/
│   ├── decorators/         @Public @Roles @CurrentUser
│   ├── filters/            Manejo global de excepciones
│   ├── guards/             JwtAuthGuard, RolesGuard
│   ├── interceptors/       Transform, Logger
│   └── dto/                DTOs compartidos (paginación, filtros)
├── database/
│   ├── migrations/         Migraciones versionadas
│   └── seeders/            Datos iniciales idempotentes
└── modules/<nombre>/
    ├── <nombre>.module.ts
    ├── <nombre>.controller.ts
    ├── <nombre>.service.ts
    ├── dto/
    └── entities/
```

- Archivos en `kebab-case`: `product.entity.ts`, `supplier-order.entity.ts`
- Clases en `PascalCase`
- Archivos de entidad terminan en `.entity.ts`; TypeORM los descubre por glob
- Las claves de inyección de TypeORM son el nombre de la entidad en `snake_case`
  minusúsculas con guiones bajos: `'product'`, `'supplier_order'`

### Frontend (React)

```text
src/
├── main.tsx
├── App.tsx
├── app/            Router, guards, providers
├── features/<nombre>/
│   ├── index.ts               Barrel
│   ├── views/                 Componentes de ruta
│   ├── components/            UI del módulo
│   ├── services/              Cliente HTTP
│   ├── schemas/               Validación con zod
│   ├── hooks/                 Lógica reutilizable
│   └── types/                 Interfaces
├── design-system/
│   ├── ui/                    Componentes base
│   ├── layout/                Layouts
│   └── theme/                 Paleta y tema
└── shared/                    Hooks y utilidades globales
```

- Componentes y vistas en `PascalCase`: `ProductsView.tsx`, `StatCard.tsx`
- Funciones, hooks y utilidades en `camelCase`: `useProducts.ts`, `formatMoney.ts`
- Coloca `@/` como alias a `src/` (ya configurado en Vite y tsconfig)
- Barrel `index.ts` en cada carpeta que se importe desde fuera
- Todo texto visible para el usuario, en español
- Formatos: `formatMoney(1234.5)` → `$1,234.50`, fechas `dd/mm/aaaa`

### Estado

| Tipo                  | Herramienta                                |
| --------------------- | ------------------------------------------ |
| Datos del servidor    | TanStack Query (`useQuery`, `useMutation`) |
| Sesión y rol          | Zustand                                    |
| Carrito del POS       | Zustand                                    |
| Estado local de vista | `useState` / `useReducer`                  |
| Formularios           | React Hook Form + zod                      |
| Filtros y página      | `useSearchParams`                          |

**Regla:** el estado que vive en el servidor nunca se duplica en un store. Duplicarlo
garantiza desincronización.

## 6. Pruebas

Toda lógica de negocio lleva prueba. Obligatorio cuando:

- Toca stock, ventas, crédito o folios
- Implementa una regla de negocio de `docs/02-prd-mvp-moscow.md` §2
- Tiene un caso borde obvio (0, negativo, vacío, límite)

```text
Backend   → Vitest + Supertest
  test/*.e2e-spec.ts        Integración contra PostgreSQL real
  src/**/*.spec.ts          Unitaria, junto al código
Frontend  → Vitest + Testing Library
  src/**/*.test.ts(x)       Co-localizado con el código
```

Nombres de `describe` e `it` **en español**, describiendo el comportamiento:

```ts
describe('InventoryService', () => {
  it('rechaza una merma mayor que el stock disponible', () => {});
  it('registra el movimiento con usuario, motivo y fecha', () => {});
});
```

Para pruebas de concurrencia usa `Promise.allSettled` y verifica que exactamente una
operación tuvo éxito. El ejemplo canónico está en
`docs/12-plan-pruebas.md` §4.3.

## 7. Commits

Conventional Commits, **en inglés**, validados por commitlint (el hook no deja pasar
un mensaje inválido).

```text
<tipo>(<alcance>): <descripción en imperativo, minúsculas, sin punto>
```

Tipos: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`

Alcances del dominio: `auth` `users` `branches` `categories` `suppliers` `products`
`inventory` `pos` `sales` `cash` `purchases` `customers` `reports` `db` `api` `ui`
`deps` `docker` `docs` `cicd`

```bash
git commit -m "feat(inventory): add low stock alert query" -m "Refs: HU-24 / RF-18"
```

El detalle completo está en `docs/06-convencion-de-commits.md`.

## 8. Ramas

```text
main                          producción, solo tags
develop                       integración
feature/hu-14-stock-movements  nueva funcionalidad
fix/hu-07-negative-stock       corrección
release/v0.4.0                preparación de versión
hotfix/v0.4.1-folio           corrección crítica en producción
```

- Nace siempre desde `develop` actualizada
- Se elimina al fusionarse
- Un PR requiere al menos una aprobación
- `develop` y `main` están protegidas: sin force push, CI en verde obligatorio

## 9. Verificación antes de entregar

```bash
pnpm lint          # ESLint en ambos workspaces
pnpm typecheck     # tipos sin emitir
pnpm test          # pruebas de backend y frontend
pnpm build         # build de producción
```

Los cuatro deben pasar. Si alguno falla, no entregues: corrige o explica por qué no
pudiste.

## 10. Documentación

Si el cambio afecta el comportamiento del sistema, actualiza el documento
correspondiente **en el mismo commit**:

| El cambio afecta…             | Actualiza                                                        |
| ----------------------------- | ---------------------------------------------------------------- |
| El esquema de datos           | `docs/10-esquema-base-de-datos.md`                               |
| El estado de un requerimiento | `docs/09-matriz-trazabilidad.md`                                 |
| El backlog o un sprint        | `docs/03-backlog-del-producto.md` u `docs/08-plan-desarrollo.md` |
| El despliegue o Docker        | `docs/11-guia-despliegue.md`                                     |
| La arquitectura               | `docs/14-arquitectura.md`                                        |
| Un requerimiento nuevo        | `docs/02-prd-mvp-moscow.md`                                      |
| Los comandos del proyecto     | `README.md`                                                      |

Cada documento tiene su tabla de historial de versiones al final. Agrégale una fila.

## 11. Errores frecuentes

| Error                                  | Cómo evitarlo                                          |
| -------------------------------------- | ------------------------------------------------------ |
| `UPDATE` directo sobre `product_stock` | Siempre insertar primero el `stock_movement`           |
| Lógica de negocio en el controller     | Moverla al service                                     |
| Falta el `await` en una transacción    | `dataSource.transaction()` se espera siempre           |
| `synchronize: true`                    | Está prohibido salvo en una base desechable de pruebas |
| `any` sin justificación                | Usa `unknown` y estrecha el tipo                       |
| Commit en español o sin alcance        | El hook de commitlint lo rechaza                       |
| Crear una columna `balance`            | El saldo se deriva sumando transacciones               |
| Texto de interfaz en inglés            | Todo lo visible al usuario va en español               |
