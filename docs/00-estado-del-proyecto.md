# Estado del Proyecto — StoreCore

**Versión:** 1.1.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

---

## 1. Situación Actual

| Campo                          | Valor                                                 |
| ------------------------------ | ----------------------------------------------------- |
| **Fase**                       | Sprint 0 en cierre: cimientos completos y verificados |
| **Versión actual**             | `0.1.0`                                               |
| **Versión objetivo del MVP**   | `0.7.0` (fin del Sprint 6)                            |
| **Primer release estable**     | `1.0.0` (fin del Sprint 7)                            |
| **Sprint actual**              | Sprint 0 — Cimientos (100 %)                          |
| **Avance**                     | 9 % del MVP (34 de 198 puntos)                        |
| **Fecha de inicio**            | 25 de septiembre de 2026                              |
| **Fecha estimada de `v1.0.0`** | 21 de enero de 2027                                   |

## 2. Avance por Sprint

| Sprint   | Objetivo                           | Versión | Fechas                   | Estado    | Avance |
| -------- | ---------------------------------- | ------- | ------------------------ | --------- | ------ |
| Sprint 0 | Cimientos, auth, roles, sucursales | `0.1.0` | 25 sep – 8 oct 2026      | EN CIERRE | 100 %  |
| Sprint 1 | Catálogo maestro                   | `0.2.0` | 9 – 22 oct 2026          | PENDIENTE | 0 %    |
| Sprint 2 | Inventario y alertas               | `0.3.0` | 23 oct – 5 nov 2026      | PENDIENTE | 0 %    |
| Sprint 3 | Punto de venta                     | `0.4.0` | 6 – 19 nov 2026          | PENDIENTE | 0 %    |
| Sprint 4 | Compras a proveedores              | `0.5.0` | 20 nov – 3 dic 2026      | PENDIENTE | 0 %    |
| Sprint 5 | Clientes y crédito                 | `0.6.0` | 4 – 17 dic 2026          | PENDIENTE | 0 %    |
| Sprint 6 | Reportes y cortes                  | `0.7.0` | 18 dic 2026 – 7 ene 2027 | PENDIENTE | 0 %    |
| Sprint 7 | UAT y release                      | `1.0.0` | 8 – 21 ene 2027          | PENDIENTE | 0 %    |

## 3. Avance por Épica

| Épica | Nombre                               | Historias | Puntos  | Estado    | Avance  |
| ----- | ------------------------------------ | --------- | ------- | --------- | ------- |
| E-1   | Cimientos e infraestructura          | 6         | 21      | TERMINADO | 100 %   |
| E-2   | Autenticación, usuarios y sucursales | 6         | 13      | TERMINADO | 92 %    |
| E-3   | Catálogo de productos                | 7         | 21      | PENDIENTE | 0 %     |
| E-4   | Inventario y alertas                 | 7         | 21      | PENDIENTE | 0 %     |
| E-5   | Punto de venta                       | 8         | 34      | PENDIENTE | 0 %     |
| E-6   | Compras a proveedores                | 6         | 21      | PENDIENTE | 0 %     |
| E-7   | Clientes y crédito                   | 6         | 21      | PENDIENTE | 0 %     |
| E-8   | Reportes y cortes de caja            | 7         | 26      | PENDIENTE | 0 %     |
| E-9   | UAT y estabilización                 | 3         | 13      | PENDIENTE | 0 %     |
|       | **Total**                            | **56**    | **191** |           | **0 %** |

## 4. Avance por Requerimiento

| Categoría                     | Total  | Must   | Should | Could | Implementados | Pendientes |
| ----------------------------- | ------ | ------ | ------ | ----- | ------------- | ---------- |
| Requerimientos funcionales    | 51     | 48     | 4      | 5     | 7             | 44         |
| Requerimientos no funcionales | 16     | 14     | 3      | 1     | 8             | 8          |
| Reglas de negocio             | 10     | 10     | 0      | 0     | 4             | 6          |
| **Total**                     | **77** | **72** | **7**  | **6** | **19**        | **58**     |

**Implementados en el Sprint 0:** RF-01 a RF-04, RF-06, RF-51 · RNF-01, RNF-05,
RNF-06, RNF-08, RNF-09, RNF-10, RNF-11, RNF-15 · RN-1, RN-8, RN-10 y el esquema
completo de datos que respalda RN-2 a RN-7.

## 5. Entregables de Documentación

| Documento                      | Estado   | Observaciones                   |
| ------------------------------ | -------- | ------------------------------- |
| [00] Estado del proyecto       | COMPLETO | Este documento                  |
| [01] Definición de la solución | COMPLETO | Alcance y objetivos definidos   |
| [02] PRD MVP (MoSCoW)          | COMPLETO | 51 RF + 16 RNF priorizados      |
| [03] Backlog del producto      | COMPLETO | 56 historias en 9 épicas        |
| [04] Plan Scrum                | COMPLETO | 8 sprints planificados          |
| [05] Estrategia de versionado  | COMPLETO | SemVer y calendario definidos   |
| [06] Convención de commits     | COMPLETO | Con enforcement definido        |
| [07] Convención de ramas       | COMPLETO | Git Flow simplificado           |
| [08] Plan de desarrollo        | COMPLETO | Tareas por sprint               |
| [09] Matriz de trazabilidad    | COMPLETO | RF → HU → Sprint → prueba       |
| [10] Esquema de base de datos  | COMPLETO | 14 entidades especificadas      |
| [11] Guía de despliegue        | COMPLETO | Procedimiento con Docker        |
| [12] Plan de pruebas           | COMPLETO | 4 niveles de prueba             |
| [13] Glosario                  | COMPLETO | Términos de negocio y técnicos  |
| [14] Arquitectura              | COMPLETO | Capas, módulos y flujo de venta |
| [15] Checklist UAT Sprint 1    | COMPLETO | 60 casos de verificación        |

## 6. Stack tecnológico

Todas las versiones son las **más recientes disponibles** al momento de la creación.

### 6.1 Backend

| Tecnología          | Versión   | Propósito                                                                      |
| ------------------- | --------- | ------------------------------------------------------------------------------ |
| Node.js             | 24.x      | Entorno de ejecución                                                           |
| TypeScript          | 6.0.3     | Lenguaje. La 7.0.2 no expone la API de compilador que exige NestJS CLI (§12.2) |
| NestJS              | 12.1.0    | Framework del servidor. ESM puro: el backend es `"type": "module"` (§12.2)     |
| TypeORM             | 1.1.1     | ORM                                                                            |
| pg                  | 8.23.0    | Driver de PostgreSQL                                                           |
| PostgreSQL          | 16-alpine | Base de datos (verificada sobre 17.11 en local)                                |
| class-validator     | 0.15.1    | Validación de DTO                                                              |
| class-transformer   | 0.5.1     | Transformación de objetos                                                      |
| bcrypt              | 6.0.0     | Hash de contraseñas                                                            |
| @nestjs/jwt         | 12.0.2    | Emisión de tokens                                                              |
| @nestjs/passport    | 12.0.0    | Estrategias de autenticación                                                   |
| @nestjs/config      | 12.0.1    | Configuración por entorno                                                      |
| @nestjs/swagger     | 12.0.2    | Documentación OpenAPI                                                          |
| helmet              | 8.3.0     | Cabeceras HTTP seguras                                                         |
| joi                 | 18.2.9    | Validación de variables de entorno                                             |
| Vitest              | 5.0.2     | Framework de pruebas del backend (§12.2)                                       |
| @vitest/coverage-v8 | 5.0.2     | Reporte de cobertura                                                           |
| supertest           | 7.3.0     | Pruebas de HTTP                                                                |
| dotenv              | 18.0.4    | Carga del `.env` en los scripts que corren fuera de Nest                       |
| ESLint              | 10.11.0   | Linter                                                                         |
| Prettier            | 3.9.9     | Formateador                                                                    |
| TypeScript ESLint   | 8.70.1    | Reglas de TS                                                                   |

### 6.2 Frontend

| Tecnología               | Versión | Propósito                         |
| ------------------------ | ------- | --------------------------------- |
| React                    | 19.3.0  | Biblioteca de interfaz            |
| React DOM                | 19.3.0  | Renderizado en el navegador       |
| Vite                     | 8.3.1   | Bundler y servidor de desarrollo  |
| @vitejs/plugin-react-swc | 4.3.3   | Compilación de React con SWC      |
| React Router             | 7.18.4  | Enrutamiento                      |
| TanStack Query           | 5.103.2 | Estado del servidor               |
| Zustand                  | 5.0.15  | Estado de sesión y POS            |
| Tailwind CSS             | 4.3.3   | Estilos de utilidad               |
| MUI                      | 9.4.0   | Componentes base                  |
| MUI X Data Grid          | 9.14.0  | Tablas de datos                   |
| React Hook Form          | 7.88.0  | Formularios                       |
| Zod                      | 4.6.5   | Validación de esquemas            |
| Axios                    | 1.20.0  | Cliente HTTP                      |
| lucide-react             | 1.48.0  | Iconos                            |
| Recharts                 | 3.10.1  | Gráficos                          |
| Vitest                   | 5.0.2   | Framework de pruebas              |
| Testing Library          | 16.3.3  | Pruebas de componentes            |
| jsdom                    | 30.1.1  | Entorno de navegador para pruebas |

### 6.3 Infraestructura

| Tecnología     | Versión | Propósito                       |
| -------------- | ------- | ------------------------------- |
| Docker         | 29.8.1  | Contenedores                    |
| Docker Compose | 2.x     | Orquestación local y producción |
| Nginx          | alpine  | Servidor web y proxy inverso    |
| Git            | 2.55.0  | Control de versiones            |
| pnpm           | 12.6.0  | Gestor de paquetes              |
| GitHub Actions | —       | Integración continua            |
| Dependabot     | —       | Actualización de dependencias   |

### 6.4 Tooling

| Tecnología                | Versión | Propósito                                  |
| ------------------------- | ------- | ------------------------------------------ |
| commitlint                | 21.2.3  | Validación de commits                      |
| Husky                     | 9.1.7   | Hooks de Git                               |
| lint-staged               | 17.5.1  | Ejecución de tareas en archivos preparados |
| ESLint plugin react-hooks | 7.1.1   | Reglas de hooks de React                   |
| globals                   | 17.12.0 | Variables globales para ESLint             |

## 7. Hitos

| Hito                                                   | Fecha objetivo | Estado    |
| ------------------------------------------------------ | -------------- | --------- |
| **Hito 0** — Sistema levanta y un usuario puede entrar | 8 oct 2026     | PENDIENTE |
| **Hito 1** — **El sistema es vendible** (POS + corte)  | 19 nov 2026    | PENDIENTE |
| **Hito 2** — MVP completo (6 módulos)                  | 7 ene 2027     | PENDIENTE |
| **Hito 3** — Release estable `v1.0.0`                  | 21 ene 2027    | PENDIENTE |

## 8. Riesgos Abiertos

| #   | Riesgo                                       | Prob. | Impacto | Estado  | Mitigación                                                                |
| --- | -------------------------------------------- | ----- | ------- | ------- | ------------------------------------------------------------------------- |
| R-1 | Alcance del MVP demasiado amplio (6 módulos) | Alta  | Alto    | ABIERTO | Priorización MoSCoW; Hito 1 entrega valor temprano                        |
| R-2 | Descuadre de inventario por concurrencia     | Media | Alto    | ABIERTO | Transacciones + `FOR UPDATE` + `CHECK` en BD + prueba de concurrencia     |
| R-3 | El dueño no adopta la herramienta            | Media | Alto    | ABIERTO | UAT temprano; el dueño valida el catálogo en el Sprint 1                  |
| R-4 | El dueño no responde las revisiones a tiempo | Media | Medio   | ABIERTO | Ventana de 2 días; si no responde, se decide por criterio documentado     |
| R-5 | Trabajo sostenido de una sola persona        | Media | Medio   | ABIERTO | Compromiso conservador; medio día de descanso por sprint                  |
| R-6 | Internet intermitente en la tienda           | Baja  | Medio   | ABIERTO | Operación local documentada; modo offline es post-MVP                     |
| R-7 | Los sprints 6 y 7 cruzan fin de año          | Media | Medio   | ABIERTO | No se interrumpe el ritmo; se reduce el compromiso, no se salta el sprint |
| R-8 | Sin servidor VPS disponible                  | Media | Alto    | ABIERTO | Validar disponibilidad al cierre del Sprint 0; hay 4 meses de margen      |

## 9. Decisiones Pendientes

| #   | Decisión                                                  | Fecha límite       | Responsable   | Estado    |
| --- | --------------------------------------------------------- | ------------------ | ------------- | --------- |
| D-1 | Confirmar disponibilidad del VPS para despliegue          | Cierre de Sprint 0 | Administrador | PENDIENTE |
| D-2 | Validar con el dueño los 50 productos del seeder          | Sprint 1           | Product Owner | PENDIENTE |
| D-3 | Definir si el límite de crédito es por cliente o global   | Sprint 5           | Product Owner | PENDIENTE |
| D-4 | Confirmar si el ticket lleva datos fiscales del negocio   | Sprint 3           | Product Owner | PENDIENTE |
| D-5 | Definir el número de decimales en unidad (3) y moneda (2) | Sprint 1           | Equipo        | PENDIENTE |

## 10. Dependencias Externas

| Dependencia               | Tipo            | Estado     | Nota                            |
| ------------------------- | --------------- | ---------- | ------------------------------- |
| Docker Engine             | Infraestructura | DISPONIBLE | Versión 29.8.1 instalada        |
| PostgreSQL 16             | Infraestructura | PENDIENTE  | Se levanta por Docker           |
| Servidor VPS              | Infraestructura | PENDIENTE  | Requerido para producción (D-1) |
| Dominio y certificado TLS | Infraestructura | PENDIENTE  | Let's Encrypt, gratuito         |
| Cuenta de GitHub          | SCM             | PENDIENTE  | Para CI y Dependabot            |

## 11. Próximos Pasos

1. Crear el monorepo y el esqueleto de ambos workspaces — Sprint 0
2. Levantar la infraestructura con Docker Compose — Sprint 0
3. Implementar autenticación, roles y sucursales — Sprint 0
4. Escribir la migración inicial con las 14 entidades — Sprint 0
5. Configurar CI, commitlint y Husky — Sprint 0
6. Ejecutar la checklist UAT del Sprint 1 con el dueño

## 12. Verificación del Sprint 0

Todo lo siguiente se ejecutó de verdad contra PostgreSQL local. No es una lista
de intenciones: son resultados medidos el 25 de septiembre de 2026.

| Comprobación                                | Resultado                                                                                                                          |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` en ambos workspaces             | 0 errores, 0 avisos                                                                                                                |
| `pnpm typecheck` en ambos workspaces        | 0 errores                                                                                                                          |
| `pnpm build` en ambos workspaces            | Correcto                                                                                                                           |
| Pruebas unitarias backend                   | 61 en verde                                                                                                                        |
| Pruebas e2e backend (API + PostgreSQL real) | 18 en verde                                                                                                                        |
| Pruebas frontend                            | 23 en verde                                                                                                                        |
| **Total de pruebas**                        | **102 en verde**                                                                                                                   |
| Cobertura de líneas (backend)               | 84.86 % — supera la meta de 70 % (RNF-08)                                                                                          |
| Cobertura de ramas                          | 65.44 %                                                                                                                            |
| Migración inicial sobre base vacía          | 15 tablas, 8 enums, 19 CHECK, 2 índices únicos parciales                                                                           |
| Seeders ejecutados dos veces                | Idempotentes: 0 duplicados                                                                                                         |
| Arranque de la API                          | 9 rutas mapeadas,Swagger en `/api/docs`                                                                                            |
| Login ADMIN y CASHIER                       | Token JWT válido, expiración 8 h                                                                                                   |
| Control de acceso por rol                   | Cajero recibe 403 en ruta de ADMIN                                                                                                 |
| Validación de entrada                       | Código duplicado → 409, campo desconocido → 400                                                                                    |
| Restricciones de integridad                 | 6 comprobadas: stock negativo, precio de venta, código de barras, cantidad de movimiento, total inconsistente y doble caja abierta |
| Respaldo de base de datos                   | Generado (10 KB) y verificado íntegro                                                                                              |

### 12.1 Restricciones de integridad verificadas

| #   | Restricción                    | Regla | Comportamiento comprobado                               |
| --- | ------------------------------ | ----- | ------------------------------------------------------- |
| 1   | `ck_product_stock_quantity`    | RN-2  | Rechaza `quantity = -5`                                 |
| 2   | `ck_product_prices`            | RF-10 | Rechaza precio de venta menor al de compra              |
| 3   | `uq_product_barcode` (parcial) | RF-21 | Rechaza código de barras repetido, admite varios `NULL` |
| 4   | `ck_stock_movement_quantity`   | RN-3  | Rechaza movimiento de cantidad 0                        |
| 5   | `ck_sale_totals`               | RN-7  | Rechaza total distinto de `subtotal - discount`         |
| 6   | `uq_cash_shift_open` (parcial) | RF-29 | Rechaza dos cajas abiertas en la misma sucursal         |

### 12.2 Decisiones técnicas tomadas por incompatibilidad del stack

Estas tres desviaciones respecto a "todo a la última versión" son deliberadas y
están documentadas para que nadie intente "actualizar" y romper el proyecto.

| #   | Lo que se pidió    | Lo que se usa        | Motivo                                                                                                                                              |
| --- | ------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | TypeScript 7.0.2   | **TypeScript 6.0.3** | TypeScript 7 expone solo el ejecutable `tsc`; la API de compilador que usa NestJS CLI vuelve en 7.1. Con 7.0.2 el `nest build` falla outright.      |
| 2   | Backend CommonJS   | **Backend ESM**      | NestJS 12 es ESM puro (`"type": "module"`). No hay build CommonJS posible.                                                                          |
| 3   | Jest en el backend | **Vitest**           | TypeScript 6 eliminó `moduleResolution: node10`, con el que ts-jest compila a CommonJS. Vitest resuelve ESM de forma nativa y sin banderas de Node. |

Además, `emitDecoratorMetadata` genera referencias a clases que se evalúan al
cargar el módulo; con entidades que se referencian entre sí en ESM eso revienta
con _"Cannot access 'Branch' before initialization"_. Se resolvió con `import type`
y destino de texto en el lado inverso de cada relación (ver `docs/14-arquitectura.md`).

## 13. Métricas de Calidad

| Métrica                             | Meta       | Actual                    |
| ----------------------------------- | ---------- | ------------------------- |
| Cobertura de pruebas backend        | ≥ 70 %     | 84.86 %                   |
| Pruebas frontend                    | ≥ 20 casos | 23                        |
| Errores de ESLint                   | 0          | 0                         |
| Errores de TypeScript               | 0          | 0                         |
| Vulnerabilidades de producción      | 0          | 0                         |
| Disponibilidad                      | ≥ 99 %     | — (a medir en producción) |
| Defectos de alta severidad abiertos | 0          | 0                         |

## 14. Registro de Cambios de Estado

| Fecha       | Sprint | Evento                  | Descripción                                                              |
| ----------- | ------ | ----------------------- | ------------------------------------------------------------------------ |
| 25 sep 2026 | —      | Inicio del proyecto     | Documentación completa del proyecto creada                               |
| 25 sep 2026 | —      | Decisión de stack       | NestJS 12 + React 19 + PostgreSQL 16, versiones más recientes            |
| 25 sep 2026 | —      | Decisión de alcance     | 6 módulos dentro del MVP, 7 sprints de desarrollo                        |
| 25 sep 2026 | —      | Decisión de nombre      | StoreCore                                                                |
| 25 sep 2026 | S0     | Cimientos completos     | Monorepo, Docker, CI, auth, roles, sucursales, health                    |
| 25 sep 2026 | S0     | Esquema verificado      | 15 tablas, 8 enums, 19 CHECK y 2 índices parciales en PostgreSQL real    |
| 25 sep 2026 | S0     | 50 productos reales     | Seeders idempotentes cargados y verificados                              |
| 25 sep 2026 | S0     | 102 pruebas en verde    | 61 unitarias, 18 e2e y 23 de frontend                                    |
| 25 sep 2026 | S0     | Cobertura 84.86 %       | Supera la meta de RNF-08 (70 %)                                          |
| 25 sep 2026 | S0     | 3 desviaciones de stack | TypeScript 6.0.3, backend ESM y Vitest, por incompatibilidad (ver §12.2) |

---

## 15. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                                                                                 |
| ------- | ----------- | ---------------- | ------------------------------------------------------------------------------------------- |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento                                                              |
| 1.1.0   | 25 sep 2026 | Equipo StoreCore | Cierre del Sprint 0: verificación real, cobertura, desviaciones de stack y estado de avance |
