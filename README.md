# StoreCore

Sistema de gestión para tiendas de abarrotes (pulperías): catálogo de productos,
control de inventario con alertas, punto de venta, compras a proveedores, crédito
a clientes, reportes financieros y cortes de caja.

Multi-sucursal, multi-usuario, con interfaz en español y listo para operar desde
una computadora o tablet en el mostrador.

---

## Estado del proyecto

| Campo             | Valor                        |
| ----------------- | ---------------------------- |
| Versión           | `0.1.0`                      |
| Sprint actual     | Sprint 0 — Cimientos (100 %) |
| MVP objetivo      | `0.7.0` (fin del Sprint 6)   |
| Release estable   | `1.0.0` (fin del Sprint 7)   |
| Avance            | 9 % (34 de 198 puntos)       |
| Pruebas           | 102 en verde                 |
| Cobertura backend | 84.86 %                      |

El detalle completo del avance está en [`docs/00-estado-del-proyecto.md`](docs/00-estado-del-proyecto.md).

## Módulos del MVP

| #   | Módulo                       | Qué resuelve                                                                                           |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1   | **Autenticación y usuarios** | Login JWT, roles `ADMIN` y `CASHIER`, gestión de usuarios y sucursales                                 |
| 2   | **Catálogo**                 | Categorías, proveedores y productos con SKU, código de barras y precios                                |
| 3   | **Inventario**               | Stock por sucursal, movimientos, ajustes, merma, alertas de stock mínimo y kardex                      |
| 4   | **Punto de venta**           | Búsqueda, carrito, descuentos, validación de stock, métodos de pago, ticket, anulación y corte de caja |
| 5   | **Compras**                  | Órdenes a proveedores con recepción que actualiza el stock y sugerencias de reposición                 |
| 6   | **Crédito y reportes**       | Clientes con fiado, abonos, límites de crédito, dashboard y seis reportes                              |

## Stack

### Backend — API REST

| Tecnología      | Versión |
| --------------- | ------- |
| Node.js         | 24.x    |
| TypeScript      | 7.0.2   |
| NestJS          | 12.1.0  |
| TypeORM         | 1.1.1   |
| PostgreSQL      | 16      |
| class-validator | 0.15.1  |
| bcrypt          | 6.0.0   |
| Vitest          | 5.0.2   |
| Supertest       | 7.3.0   |

### Frontend — Interfaz web

| Tecnología      | Versión |
| --------------- | ------- |
| React           | 19.3.0  |
| Vite            | 8.3.1   |
| React Router    | 7.18.4  |
| TanStack Query  | 5.103.2 |
| Zustand         | 5.0.15  |
| Tailwind CSS    | 4.3.3   |
| MUI             | 9.4.0   |
| React Hook Form | 7.88.0  |
| Zod             | 4.6.5   |
| Vitest          | 5.0.2   |

### Infraestructura

| Tecnología     | Versión |
| -------------- | ------- |
| Docker         | 29.8.1  |
| Docker Compose | 2.x     |
| Nginx          | alpine  |
| pnpm           | 12.6.0  |
| GitHub Actions | —       |

Todas las versiones son las más recientes disponibles al momento de la creación
del proyecto. La lista completa está en
[`docs/00-estado-del-proyecto.md`](docs/00-estado-del-proyecto.md#6-stack-tecnológico).

## Requisitos previos

| Herramienta    | Versión mínima   | Verificar con            |
| -------------- | ---------------- | ------------------------ |
| Node.js        | 20.19 (o 22.12+) | `node -v`                |
| pnpm           | 12.0             | `pnpm -v`                |
| Docker         | 24.0             | `docker -v`              |
| Docker Compose | 2.20             | `docker compose version` |
| Git            | 2.40             | `git --version`          |

## Instalación

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar el entorno
cp .env.example .env
# Edita .env y ajusta DATABASE_PASSWORD y JWT_SECRET

# 3. Levantar PostgreSQL
docker compose up -d postgres

# 4. Aplicar migraciones
pnpm --filter backend migration:run

# 5. Cargar datos iniciales (50 productos reales de abarrotes)
pnpm --filter backend seed:run

# 6. Crear el usuario administrador
pnpm --filter backend user:create-admin

# 7. Arrancar en modo desarrollo
pnpm dev
```

| Servicio                | URL                                 |
| ----------------------- | ----------------------------------- |
| Frontend                | http://localhost:5173               |
| API                     | http://localhost:3000/api/v1        |
| Documentación de la API | http://localhost:3000/api/docs      |
| Health check            | http://localhost:3000/api/v1/health |

## Comandos

### Desarrollo

| Comando             | Qué hace                            |
| ------------------- | ----------------------------------- |
| `pnpm dev`          | Levanta backend y frontend a la vez |
| `pnpm dev:backend`  | Solo la API, con recarga automática |
| `pnpm dev:frontend` | Solo la interfaz                    |

### Calidad

| Comando           | Qué hace                         |
| ----------------- | -------------------------------- |
| `pnpm lint`       | ESLint en ambos workspaces       |
| `pnpm lint:fix`   | ESLint corrigiendo lo corregible |
| `pnpm typecheck`  | Verificación de tipos sin emitir |
| `pnpm test`       | Pruebas de backend y frontend    |
| `pnpm test:cov`   | Cobertura del backend            |
| `pnpm format`     | Prettier en todo el proyecto     |
| `pnpm commitlint` | Valida el último commit          |

### Base de datos

| Comando                                                | Qué hace                                 |
| ------------------------------------------------------ | ---------------------------------------- |
| `pnpm --filter backend migration:generate -- <nombre>` | Genera una migración desde las entidades |
| `pnpm --filter backend migration:run`                  | Aplica las migraciones pendientes        |
| `pnpm --filter backend migration:revert`               | Revierte la última migración             |
| `pnpm --filter backend seed:run`                       | Carga los datos iniciales (idempotente)  |
| `pnpm --filter backend user:create-admin`              | Crea el usuario administrador            |

### Docker

| Comando                                                   | Qué hace                               |
| --------------------------------------------------------- | -------------------------------------- |
| `docker compose up -d --build`                            | Levanta la infraestructura completa    |
| `docker compose -f docker-compose.prod.yml up -d --build` | Igual, en modo producción              |
| `docker compose down`                                     | Detiene todo                           |
| `docker compose logs -f api`                              | Sigue los logs de la API               |
| `./scripts/backup.sh`                                     | Genera un respaldo de la base de datos |

## Documentación

Toda la documentación vive en [`docs/`](docs/README.md), en español.

| Documento                                                              | Contenido                                   |
| ---------------------------------------------------------------------- | ------------------------------------------- |
| [00 — Estado del proyecto](docs/00-estado-del-proyecto.md)             | Avance, riesgos, stack completo             |
| [01 — Definición de la solución](docs/01-definicion-de-la-solucion.md) | Problema, objetivos, alcance, stakeholders  |
| [02 — PRD MVP (MoSCoW)](docs/02-prd-mvp-moscow.md)                     | Requerimientos funcionales y no funcionales |
| [03 — Backlog del producto](docs/03-backlog-del-producto.md)           | 56 historias de usuario en 9 épicas         |
| [04 — Plan Scrum](docs/04-plan-scrum.md)                               | Ceremonias, Definition of Done, sprints     |
| [05 — Estrategia de versionado](docs/05-estrategia-de-versionado.md)   | SemVer, tags, calendario de releases        |
| [06 — Convención de commits](docs/06-convencion-de-commits.md)         | Conventional Commits y alcances             |
| [07 — Convención de ramas](docs/07-convencion-de-ramas.md)             | Git Flow simplificado                       |
| [08 — Plan de desarrollo](docs/08-plan-desarrollo.md)                  | Roadmap y tareas por sprint                 |
| [09 — Matriz de trazabilidad](docs/09-matriz-trazabilidad.md)          | RF → HU → Sprint → prueba                   |
| [10 — Esquema de base de datos](docs/10-esquema-base-de-datos.md)      | 14 entidades, ERD, consultas críticas       |
| [11 — Guía de despliegue](docs/11-guia-despliegue.md)                  | Docker, Nginx, backup, restauración         |
| [12 — Plan de pruebas](docs/12-plan-pruebas.md)                        | 4 niveles, casos críticos                   |
| [13 — Glosario](docs/13-glosario.md)                                   | Términos de negocio y técnicos              |
| [14 — Arquitectura](docs/14-arquitectura.md)                           | Capas, módulos, flujo de venta              |
| [15 — Checklist UAT Sprint 1](docs/15-checklist-uat-s1.md)             | 78 casos de verificación                    |

## Convenciones

| Elemento           | Regla                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Commits            | [Conventional Commits](docs/06-convencion-de-commits.md), en inglés, validados por commitlint                         |
| Ramas              | [Git Flow simplificado](docs/07-convencion-de-ramas.md): `main`, `develop`, `feature/`, `fix/`, `release/`, `hotfix/` |
| Versionado         | [SemVer](docs/05-estrategia-de-versionado.md), MVP en `0.x`, tags anotados solo en `main`                             |
| Formato            | Prettier: 2 espacios, comillas simples, punto y coma, 100 columnas                                                    |
| Nombres de BD      | `snake_case` en inglés y singular; propiedades en `camelCase`                                                         |
| Comentarios y docs | Español                                                                                                               |
| Idioma del código  | Inglés                                                                                                                |

## Reglas de negocio críticas

Estas reglas se verifican con pruebas y no deben romperse:

1. El stock **nunca** es negativo. La base de datos tiene un `CHECK` que lo impide.
2. El stock **nunca** se edita directamente. Toda variación pasa por `stock_movement`.
3. Una venta descuenta stock de forma **atómica** junto con el registro de la venta.
4. Recibir una orden de compra suma stock en una **única transacción**.
5. El saldo de un cliente y el total de una venta son **derivados**, nunca editables.
6. Un producto o proveedor con historial no se borra, se desactiva.
7. El folio de venta es consecutivo por sucursal y no se reutiliza.
8. Solo un `ADMIN` anula ventas, cierra caja y gestiona usuarios.

## Contribución

Lee [`CONTRIBUTING.md`](CONTRIBUTING.md) antes de abrir un pull request.
Las instrucciones para asistentes de código están en [`AGENTS.md`](AGENTS.md).

## Licencia

[MIT](LICENSE) © 2026 Danild Pérez
