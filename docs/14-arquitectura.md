# Arquitectura — StoreCore

**Versión:** 1.0.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

---

## 1. Arquitectura General

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR (PC / TABLET)                      │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND — React 19 + Vite                  │  │
│  │                                                                │  │
│  │  app/          Router, guards, providers globales              │  │
│  │  features/     Módulos de negocio (POS, productos, ...)        │  │
│  │  design-system/  UI compartida, tema, layout                    │  │
│  │  shared/       Hooks, utilidades, constantes                    │  │
│  └────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬──────────────────────────────────────┘
                                │  HTTPS / JSON
                                │  Authorization: Bearer <JWT>
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   INFRAESTRUCTURA — Docker Compose                    │
│                                                                      │
│  ┌────────────────────────────┐      ┌────────────────────────────┐  │
│  │   web — Nginx  :80/:443    │      │  api — NestJS  :3000       │  │
│  │                            │      │                            │  │
│  │  Sirve el build estático   │─────►│  /api/v1/*                 │  │
│  │  Reverse proxy hacia api   │      │  helmet, CORS, Swagger     │  │
│  │  Termina TLS               │      │  ValidationPipe global     │  │
│  └────────────────────────────┘      └─────────────┬──────────────┘  │
│                                                     │ TypeORM          │
└─────────────────────────────────────────────────────┼────────────────┘
                                                      ▼
                                    ┌───────────────────────────────┐
                                    │   postgres:16-alpine  :5432   │
                                    │   volume: storecore_pgdata    │
                                    │   Volumen nombrado persistente │
                                    └───────────────────────────────┘
```

En desarrollo, el frontend corre en el servidor de Vite (`:5173`) con proxy hacia
`:3000`, y PostgreSQL en Docker o de forma local. El `docker compose` es para
despliegue y para un entorno integrado de pruebas.

## 2. Arquitectura del Backend

### 2.1 Capas

```text
  Petición HTTP
       │
       ▼
┌──────────────────────────────────────────┐
│  INTERCEPTORS / GUARDS / PIPES            │  Global
│  helmet · CORS · JWT guard · Roles guard  │
│  ValidationPipe · ExceptionFilter         │
└──────────────────┬───────────────────────┘
                   ▼
┌──────────────────────────────────────────┐
│  CONTROLLER  (product.controller.ts)      │  Solo HTTP:
│  rutas, status, DTOs, decoradores         │  recibe, delega, responde
│  NO contiene lógica de negocio            │
└──────────────────┬───────────────────────┘
                   ▼
┌──────────────────────────────────────────┐
│  SERVICE  (product.service.ts)            │  Toda la lógica de negocio,
│  reglas, transacciones, invariantes       │  las transacciones, los
│                                          │  bloqueos, los cálculos
└──────────────────┬───────────────────────┘
                   ▼
┌──────────────────────────────────────────┐
│  ENTITY / REPOSITORY                     │  TypeORM. Las entidades
│  (product.entity.ts)                     │  declaran el mapeo
└──────────────────┬───────────────────────┘
                   ▼
              PostgreSQL 16
```

**Regla que no se negocia:** el controller es delgado. Si hay un `if` de negocio en
un controller, esa lógica pertenece al service. Esto permite probar el negocio sin
levantar HTTP.

### 2.2 Estructura de un módulo

```text
src/modules/products/
├── products.module.ts          Registro de providers y exports
├── products.controller.ts      Rutas HTTP
├── products.service.ts         Lógica de negocio
├── dto/
│   ├── create-product.dto.ts   Validación de entrada
│   ├── update-product.dto.ts
│   ├── product-filters.dto.ts  Paginación y filtros
│   └── index.ts
├── entities/
│   ├── product.entity.ts
│   └── product-stock.entity.ts
└── products.service.spec.ts    Pruebas unitarias
```

### 2.3 Módulos

| Módulo       | Responsabilidad                                                         | Entidades                               |
| ------------ | ----------------------------------------------------------------------- | --------------------------------------- |
| `auth`       | Login, emisión y validación de JWT, cambio de contraseña                | `user`                                  |
| `users`      | CRUD de usuarios, asignación de rol y sucursal                          | `user`                                  |
| `branches`   | CRUD de sucursales                                                      | `branch`                                |
| `categories` | CRUD de categorías jerárquicas                                          | `category`                              |
| `suppliers`  | CRUD de proveedores                                                     | `supplier`                              |
| `products`   | CRUD de productos, búsqueda, catálogo                                   | `product`, `product_stock`              |
| `inventory`  | Movimientos, ajustes, merma, alertas, kardex, sugerencias de reposición | `product_stock`, `stock_movement`       |
| `pos`        | Pantalla de venta: búsqueda, carrito, totales                           | (delega en `sales`)                     |
| `sales`      | Ventas, folios, tickets, anulación, totales                             | `sale`, `sale_item`                     |
| `cash`       | Apertura, cierre, arqueo, diferencia                                    | `cash_shift`                            |
| `purchases`  | Órdenes de compra, recepción                                            | `supplier_order`, `supplier_order_item` |
| `customers`  | Clientes, crédito, abonos, estado de cuenta                             | `customer`, `customer_transaction`      |
| `reports`    | Dashboard y reportes agregados                                          | (consulta)                              |
| `health`     | Estado del servicio y de la base de datos                               | —                                       |

### 2.4 Dependencias entre módulos

```text
        auth ──── users ──── branches
                      │
                      ▼
   categories ──► products ◄── suppliers
                      │  ▲           │
                      │  │           │
                      ▼  │           │
                 inventory            │
                   │   │            │
                   │   │            │
                   ▼   ▼            ▼
              sales  cash     purchases
                   │   │            │
                   │   │            │
                   ▼   │            │
              customers ◄───────────┘
                   │
                   ▼
                reports
```

**Regla de dependencia:** un módulo solo importa de otro a través de su API pública
(lo que exporta su `.module.ts`). Nunca se accede al `repository` de otra entidad
desde un service ajeno. Si el catálogo necesita saber si un producto tiene ventas,
el módulo `sales` expone un método; el de productos no consulta la tabla `sale`.

## 3. Arquitectura del Frontend

### 3.1 Capas

```text
  main.tsx
      │
      ▼
  app/providers.tsx        QueryClientProvider, AuthProvider, tema, error boundary
      │
      ▼
  app/router.tsx           Rutas, guards, layouts
      │
      ├──► features/auth/views/LoginView.tsx
      ├──► features/dashboard/views/DashboardView.tsx
      ├──► features/products/views/ProductsView.tsx
      ├──► features/inventory/views/InventoryView.tsx
      ├──► features/pos/views/PosView.tsx
      ├──► features/purchases/views/PurchaseOrdersView.tsx
      ├──► features/customers/views/CustomersView.tsx
      └──► features/reports/views/ReportsView.tsx
             │
             ▼
      features/*/services/*.ts     Cliente HTTP por módulo
      features/*/schemas/*.ts      Validación con zod
      features/*/components/*.tsx   UI específica del módulo
             │
             ▼
      design-system/               Componentes compartidos
      shared/                      Hooks y utilidades
```

### 3.2 Estructura de un módulo del frontend

```text
src/features/products/
├── index.ts                     Barrel: reexporta lo público
├── views/
│   ├── ProductsListView.tsx      Ruta: /productos
│   └── ProductFormView.tsx       Ruta: /productos/nuevo
├── components/
│   ├── ProductTable.tsx
│   ├── ProductFilters.tsx
│   └── ProductForm.tsx
├── services/
│   └── product.service.ts       Llamadas HTTP (axios)
├── schemas/
│   └── product.schema.ts        zod: CreateProductInput, UpdateProductInput
├── hooks/
│   └── useProducts.ts           useQuery / useMutation
└── types/
    └── product.types.ts         Interfaces del dominio
```

### 3.3 Estrategia de estado

| Tipo de estado           | Herramienta                 | Ejemplo                             |
| ------------------------ | --------------------------- | ----------------------------------- |
| Estado remoto (servidor) | TanStack Query              | Productos, ventas, stock            |
| Estado de sesión         | Zustand (store de auth)     | Usuario, token, rol, sucursal       |
| Estado del POS           | Zustand (store del carrito) | Renglones del carrito en curso      |
| Estado local de vista    | `useState` / `useReducer`   | Filtros de un diálogo, tab activa   |
| Estado de formulario     | React Hook Form + zod       | Formulario de producto              |
| Estado de URL            | `useSearchParams`           | Página, orden, filtros del catálogo |

**Regla:** el estado que pertenece al servidor **nunca** se duplica en un store. Se
lee con `useQuery`. Duplicarlo garantiza desincronización.

### 3.4 Manejo de datos

```text
Componente
    │  useQuery(['products', filters], fetchProducts)
    ▼
@tanstack/react-query
    │  cacheTime: 5 min · staleTime: 30 s · retry: 1
    ▼
product.service.ts
    │  axios instance (baseURL, Authorization, interceptores)
    ▼
API /api/v1/products
```

Mutaciones invalidan la caché directamente:

```ts
const queryClient = useQueryClient();

const { mutate: createProduct } = useMutation({
  mutationFn: productService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  },
});
```

## 4. Flujo de una Venta

Este es el flujo más crítico del sistema. Cada paso está dentro de una **única
transacción de base de datos** (RN-4, RNF-03).

```text
 Cajero                     Frontend                  API                        PostgreSQL
  │                            │                      │                             │
  │ escanea código de barras   │                      │                             │
  │───────────────────────────►│                      │                             │
  │                            │ POST /api/v1/sales  │                             │
  │                            │─────────────────────►│                             │
  │                            │                      │ BEGIN;                      │
  │                            │                      │────────────────────────────►│
  │                            │                      │                             │
  │                            │                      │ 1. Verificar usuario y caja  │
  │                            │                      │    abierta                   │
  │                            │                      │                             │
  │                            │                      │ 2. Para cada renglón:        │
  │                            │                      │    SELECT ... FOR UPDATE    │
  │                            │                      │    sobre product_stock      │
  │                            │                      │────────────────────────────►│
  │                            │                      │                             │
  │                            │                      │ 3. Validar cantidad <= stock │
  │                            │                      │    Si no: ROLLBACK, 409      │
  │                            │                      │◄────────────────────────────│
  │                            │                      │                             │
  │                            │                      │ 4. Insertar sale            │
  │                            │                      │────────────────────────────►│
  │                            │                      │                             │
  │                            │                      │ 5. Insertar sale_item × N   │
  │                            │                      │────────────────────────────►│
  │                            │                      │                             │
  │                            │                      │ 6. UPDATE product_stock     │
  │                            │                      │    quantity = quantity - q  │
  │                            │                      │────────────────────────────►│
  │                            │                      │                             │
  │                            │                      │ 7. INSERT stock_movement    │
  │                            │                      │    type = SALE              │
  │                            │                      │────────────────────────────►│
  │                            │                      │                             │
  │                            │                      │ 8. Si es crédito:           │
  │                            │                      │    INSERT customer_transaction│
  │                            │                      │    y validar credit_limit    │
  │                            │                      │────────────────────────────►│
  │                            │                      │                             │
  │                            │                      │ 9. Reservar folio           │
  │                            │                      │    (SELECT ... FOR UPDATE)  │
  │                            │                      │    sobre la secuencia       │
  │                            │                      │────────────────────────────►│
  │                            │                      │                             │
  │                            │                      │ COMMIT;                     │
  │                            │                      │────────────────────────────►│
  │                            │◄─────────────────────│ 201 Created                │
  │                            │                      │   + venta + folio + ticket  │
  │◄───────────────────────────│                      │                             │
  │                            │                      │                             │
  │ ve el ticket con folio     │                      │                             │
```

**Si algo falla en cualquier paso, se hace `ROLLBACK` completo.** No queda una venta
sin stock descontado, ni stock descontado sin venta registrada.

**Secuencia de folios:** se reserva con `SELECT ... FOR UPDATE` sobre la fila de la
sucursal, no con un `MAX(sale_number) + 1`. Con dos cajeros cobrando al mismo tiempo,
el `MAX` devolvería el mismo número a ambos y se duplicaría el folio (RF-27).

## 5. Seguridad

### 5.1 Autenticación

| Aspecto                  | Decisión                                              | Referencia |
| ------------------------ | ----------------------------------------------------- | ---------- |
| Mecanismo                | JWT en bearer token                                   | RF-01      |
| Expiración               | 8 horas, configurable con `JWT_EXPIRES_IN`            | RNF-05     |
| Hash de contraseña       | bcrypt con 12 rondas                                  | RNF-05     |
| Almacenamiento del token | `localStorage` con interceptor de reintento           | —          |
| Renovación               | Al expirar, el interceptor redirige a login con aviso | HU-08      |
| HTTPS                    | Obligatorio en producción, terminado en Nginx         | —          |

### 5.2 Autorización

| Rol       | Puede                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `ADMIN`   | Todo: usuarios, sucursales, catálogo, inventario, compras, crédito, reportes, anulaciones, cierre de caja |
| `CASHIER` | POS, consulta de catálogo y stock, apertura y cierre de su caja                                           |

Implementación: guard global `JwtAuthGuard` + guard de roles `RolesGuard`, con los
decoradores `@Public()` y `@Roles(UserRole.ADMIN)` (RF-02).

**El cliente nunca decide permisos.** Ocultar un botón en la interfaz es
conveniencia, no seguridad. Cada endpoint valida el rol en el servidor.

### 5.3 Validación en dos capas

| Capa     | Herramienta                          | Propósito                                               |
| -------- | ------------------------------------ | ------------------------------------------------------- |
| Frontend | `zod`                                | Feedback inmediato, evita viajes innecesarios           |
| Backend  | `class-validator` + `ValidationPipe` | **Autoridad.** Nadie se salta la validación del cliente |

### 5.4 Endurecimiento

| Medida         | Implementación                                                               |
| -------------- | ---------------------------------------------------------------------------- |
| Cabeceras HTTP | `helmet`                                                                     |
| CORS           | Lista blanca de orígenes desde `CORS_ORIGIN`                                 |
| SQL injection  | Consultas parametrizadas de TypeORM; nunca concatenar SQL                    |
| XSS            | React escapa por defecto; no se usa `dangerouslySetInnerHTML`                |
| Rate limiting  | Límite por IP en `/api/v1/auth/login` (defensa contra fuerza bruta)          |
| Secretos       | Solo por variables de entorno; `.env` está en `.gitignore`                   |
| Errores        | `ExceptionFilter` global: el cliente recibe mensaje y código, nunca la traza |

### 5.5 Qué nunca se expone al cliente

| Dato                              | Motivo                     |
| --------------------------------- | -------------------------- |
| `password_hash`                   | Credencial                 |
| Trazas de pila en producción      | Filtran estructura interna |
| Consultas SQL                     | Filtran esquema            |
| `updated_at` de auditoría interna | No aporta al usuario final |

## 6. Estrategia de Datos

### 6.1 Migraciones

- `synchronize: false` en **todos** los entornos.
- Cada cambio de esquema es una migración en `src/database/migrations/`.
- `pnpm migration:run` se ejecuta al desplegar, antes de levantar la API.
- Los datos iniciales viven en `src/database/seeders/`, son idempotentes y se pueden
  reejecutar sin duplicar.

### 6.2 Transacciones

Transacción obligatoria en toda operación que toque stock:

| Operación       | Entidades dentro de la transacción                                             | Bloqueo                      |
| --------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| Registrar venta | `sale`, `sale_item`, `product_stock`, `stock_movement`, `customer_transaction` | `product_stock` `FOR UPDATE` |
| Anular venta    | `sale`, `product_stock`, `stock_movement`                                      | `product_stock` `FOR UPDATE` |
| Recibir orden   | `supplier_order`, `supplier_order_item`, `product_stock`, `stock_movement`     | `product_stock` `FOR UPDATE` |
| Ajustar stock   | `product_stock`, `stock_movement`                                              | `product_stock` `FOR UPDATE` |
| Registrar abono | `customer_transaction`                                                         | `customer` `FOR UPDATE`      |
| Cerrar caja     | `cash_shift`                                                                   | `cash_shift` abierto         |

### 6.3 Índice y caché

| Capa                | Estrategia                                                        |
| ------------------- | ----------------------------------------------------------------- |
| Índice de BD        | Ver §Índices de [Esquema de BD (10)](10-esquema-base-de-datos.md) |
| Caché de aplicación | Ninguna en el MVP. Se añade solo si un perfil lo justifica        |
| Caché de cliente    | TanStack Query, `staleTime` de 30 s en listas, 0 en el POS        |
| Caché de PostgreSQL | Configuración por defecto                                         |

## 7. Decisiones Técnicas (ADR resumidos)

| #   | Decisión                       | Alternativa descartada   | Motivo                                                                         |
| --- | ------------------------------ | ------------------------ | ------------------------------------------------------------------------------ |
| 1   | Monorepo con pnpm workspaces   | Dos repos separados      | Una sola instalación, una sola versión, commits atómicos                       |
| 2   | NestJS                         | Express con DI manual    | Módulos encapsulados, decoradores, ecosistema maduro                           |
| 3   | PostgreSQL                     | MySQL / SQLite           | `numeric`, índices parciales, bloqueos `FOR UPDATE` sólidos, columnas de array |
| 4   | TypeORM                        | Prisma / Drizzle         | Mapeo por decoradores coherente con NestJS; migraciones con `down`             |
| 5   | Tailwind + MUI juntos          | Solo uno                 | Tailwind para layout y detalle; MUI DataGrid para tablas con muchas filas      |
| 6   | TanStack Query                 | Redux Toolkit Query      | Menos boilerplate, caché e invalidación ya resueltas                           |
| 7   | Zustand solo para sesión y POS | Estado en Context        | Menos re-renders, sin prop drilling                                            |
| 8   | JWT en `localStorage`          | Cookies `httpOnly`       | simpler para una app de mostrador; se acepta el riesgo con HTTPS obligatorio   |
| 9   | Swagger en `/api/docs`         | Sin documentación de API | Contrato verificable y útil para el frontend                                   |
| 10  | Docker Compose                 | Kubernetes               | Tres servicios: Compose es suficiente y mucho más simple                       |

## 8. Estructura del Repositorio

```text
storecore/
├── backend/                    API REST — NestJS
├── frontend/                   Interfaz web — React + Vite
├── docs/                       Documentación (16 documentos)
├── diagrams/                   Diagramas editables (.drawio)
├── .github/
│   ├── workflows/ci.yml        Pipeline de integración continua
│   ├── ISSUE_TEMPLATE/         Plantillas de incidencias
│   └── PULL_REQUEST_TEMPLATE/  Plantilla de PR con la DoD
├── docker-compose.yml          Desarrollo e integración
├── docker-compose.prod.yml     Producción
├── .env.example                Plantilla de variables de entorno
├── .editorconfig
├── .gitignore
├── .prettierrc
├── commitlint.config.mjs
├── eslint.config.mjs           ESLint de la raíz (compartido)
├── package.json                Workspaces raíz
├── pnpm-workspace.yaml
├── AGENTS.md                   Instrucciones para asistentes de código
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## 9. Monitoreo

| Mecanismo               | Propósito                                                 | Dónde                         |
| ----------------------- | --------------------------------------------------------- | ----------------------------- |
| `GET /api/v1/health`    | Verifica que la API responde y la base está conectada     | Público, sin autenticación    |
| Health checks de Docker | Reinicio automático ante fallo                            | `docker-compose.prod.yml`     |
| `LoggerMiddleware`      | Registro de cada petición: método, ruta, duración, código | Log de la API                 |
| Logs estructurados      | Diagnóstico en producción                                 | `docker logs`                 |
| Uptime externo          | Alerta si el servicio deja de responder                   | Servicio de monitoreo externo |

---

## 10. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                    |
| ------- | ----------- | ---------------- | ------------------------------ |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento |
