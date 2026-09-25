# StoreCore — Índice de Documentación

Sistema de gestión para tiendas de abarrotes: catálogo, inventario, punto de venta,
compras, crédito a clientes, reportes y cortes de caja.

**Versión del proyecto:** 0.1.0
**Última actualización:** 25 de septiembre de 2026

---

## Convenciones de esta documentación

| Elemento          | Convención                                                            |
| ----------------- | --------------------------------------------------------------------- |
| Nombre de archivo | `NN-kebab-case.md` con prefijo numérico de dos dígitos                |
| Idioma            | Español                                                               |
| Encabezado        | Título, **Versión**, **Fecha**, **Autor**                             |
| Secciones         | Numeradas (`## 1.`, `## 2.`, …)                                       |
| Cierre            | Tabla de historial de versiones del documento                         |
| Diagramas         | ASCII en bloque de código (legible sin herramientas) + fuente Mermaid |
| Requerimientos    | `RF-nn` funcional, `RNF-nn` no funcional, `HU-nn` historia de usuario |
| Emojis            | No se usan en `docs/`                                                 |

### Estados de implementación

| Marcador       | Significado                        |
| -------------- | ---------------------------------- |
| `PENDIENTE`    | No desarrollado                    |
| `EN CURSO`     | Desarrollado en el sprint actual   |
| `IMPLEMENTADO` | En código y verificado por pruebas |
| `DESPLEGADO`   | En producción                      |

---

## Definición y requerimientos

| #   | Documento                                                    | Propósito                                                 |
| --- | ------------------------------------------------------------ | --------------------------------------------------------- |
| 00  | [Estado del Proyecto](00-estado-del-proyecto.md)             | Dónde estamos hoy, avance por sprint, riesgos abiertos    |
| 01  | [Definición de la Solución](01-definicion-de-la-solucion.md) | Problema, objetivos, alcance, stakeholders, restricciones |
| 02  | [PRD — MVP con MoSCoW](02-prd-mvp-moscow.md)                 | Requerimientos funcionales y no funcionales priorizados   |
| 13  | [Glosario](13-glosario.md)                                   | Vocabulario de negocio y técnico                          |

## Planificación y gestión

| #   | Documento                                                  | Propósito                                             |
| --- | ---------------------------------------------------------- | ----------------------------------------------------- |
| 03  | [Backlog del Producto](03-backlog-del-producto.md)         | Épicas, historias de usuario, criterios de aceptación |
| 04  | [Plan Scrum](04-plan-scrum.md)                             | Roles, ceremonias, DoD, métricas, retrospectivas      |
| 05  | [Estrategia de Versionado](05-estrategia-de-versionado.md) | SemVer, política de tags, calendario de releases      |
| 08  | [Plan de Desarrollo](08-plan-desarrollo.md)                | Roadmap Sprint 0–7, hitos, orden de ejecución         |
| 09  | [Matriz de Trazabilidad](09-matriz-trazabilidad.md)        | RF ↔ RNF ↔ HU ↔ Sprint ↔ pruebas ↔ estado             |
| 12  | [Plan de Pruebas](12-plan-pruebas.md)                      | Pirámide de pruebas, estrategia por capa, cobertura   |
| 15  | [Checklist UAT Sprint 1](15-checklist-uat-s1.md)           | Verificación de aceptación con el usuario final       |

## Técnicos

| #   | Documento                                               | Propósito                                   |
| --- | ------------------------------------------------------- | ------------------------------------------- |
| 06  | [Convención de Commits](06-convencion-de-commits.md)    | Conventional Commits y alcances del dominio |
| 07  | [Convención de Ramas](07-convencion-de-ramas.md)        | Git Flow simplificado y nombres de rama     |
| 10  | [Esquema de Base de Datos](10-esquema-base-de-datos.md) | ERD, tablas, columnas, restricciones        |
| 11  | [Guía de Despliegue](11-guia-despliegue.md)             | Requisitos, Docker, Nginx, backup, restore  |
| 14  | [Arquitectura](14-arquitectura.md)                      | Capas, módulos, diagrama, seguridad         |

## Diagramas

Ubicados en `../diagrams/`, editables en [diagrams.net](https://app.diagrams.net):

| Archivo                      | Contenido                            |
| ---------------------------- | ------------------------------------ |
| `casos/casos-uso.drawio`     | Diagrama de casos de uso del sistema |
| `clases/clases.drawio`       | Diagrama de clases de las entidades  |
| `flujos/flujo-venta.drawio`  | Flujo del proceso de venta           |
| `flujos/flujo-compra.drawio` | Flujo de compra a proveedor          |
| `flujos/despliegue.drawio`   | Topología de despliegue con Docker   |

---

## Referencias externas

- [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/)
- [Semantic Versioning 2.0.0](https://semver.org/lang/es/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [12 Factor App](https://12factor.net/es)
