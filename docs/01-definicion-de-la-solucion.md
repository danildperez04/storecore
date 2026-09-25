# Definición de la Solución — StoreCore

**Versión:** 1.0.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

---

## 1. Resumen Ejecutivo

**StoreCore** es un sistema web para administrar una tienda de abarrotes (pulquería)
que permite digitalizar el catálogo de productos, llevar control en tiempo real del
inventorio, registrar ventas en un punto de venta, generar alertas de stock bajo,
gestionar compras a proveedores, control de crédito (fiados) y producir reportes
financieros y cortes de caja.

El sistema sustituye el cuaderno y la memoria del dueño por un control trazable,
auditable y operable por 1 o 2 usuarios desde una computadora o tablet.

## 2. Problema

Actualmente el dueño de una pulquería opera el negocio de forma manual:

- **No existe inventario confiable.** Se cuenta el producto físicamente cuando falta;
  los descuadres de stock no se pueden explicar.
- **No hay registro de ventas.** El flujo de caja se anota en cuadernos; si el dueño
  no está, no hay forma de saber cuánto se vendió ni cuánto se cobró.
- **Los pedidos a proveedores son informales.** Se recuerda de memoria a quién se le
  pidió qué, y en qué cantidad quedó pendiente.
- **Los fiados se pierden.** No hay control de quién debe, cuánto debe ni hasta cuándo.
- **No hay reportes.** El dueño no sabe qué producto deja más utilidad ni cuánto
  inea realmente el negocio.

### 2.1 Causas raíz

| #   | Causa                                   | Impacto                             |
| --- | --------------------------------------- | ----------------------------------- |
| 1   | Registro manual en papel sin respaldo   | Pérdida de información              |
| 2   | Conteo de stock reactivo, no proactivo  | Quiebres de stock y ventas perdidas |
| 3   | Ausencia de trazabilidad de movimientos | Descuadres irresolubles             |
| 4   | Compras sin seguimiento formal          | Sobre-compras y faltantes           |

### 2.2 Oportunidad

Una tienda de barrio maneja entre 200 y 600 referencias. Ese volumen cabe holgadamente
en un sistema de escritorio web, operándose por una o dos personas, sin requieren
caja ni una PC adicional. El sistema es desproporcionadamente barato frente al
costo de perder control del inventario.

## 3. Objetivos

### 3.1 Objetivo general

Proporcionar una herramienta web que permita al dueño operar y controlar su tienda de
abarrotes: catálogo, inventario, ventas, compras, crédito, reportes y cortes de caja,
desde una sola plataforma.

### 3.2 Objetivos específicos

| #    | Objetivo                                   | Indicador de éxito                                               |
| ---- | ------------------------------------------ | ---------------------------------------------------------------- |
| OG-1 | Digitalizar el catálogo de productos       | 100% del inventario en el sistema al cierre del Sprint 1         |
| OG-2 | Tener control de inventario en tiempo real | Cada venta descuenta stock al instante; 0 quiebres por descuadre |
| OG-3 | Alertar faltantes antes del quiebre        | Alerta automática cuando stock ≤ stock mínimo                    |
| OG-4 | Registrar todas las ventas digitalmente    | 100% de las ventas quedan en el sistema; cierre de caja diario   |
| OG-5 | Ordenar las compras a proveedores          | Orden de compra digital con recepción que actualiza stock        |
| OG-6 | Controlar el crédito (fiados)              | Estado de cuenta por cliente con saldo y abonos                  |
| OG-7 | Generar reportes de decisión               | Reportes de ventas, rotación y márgenes disponibles              |
| OG-8 | Reducir el tiempo de atención en mostrador | Venta completa en ≤ 3 interacciones                              |

### 3.3 Fuera de objetivo en el MVP

- E-commerce y venta en línea al consumidor final.
- Facturación electrónica (CFDI / SAT).
- Contabilidad completa (balanza, pólizas, ISR).
- Aplicación móvil nativa.
- Integración con hardware de POS dedicado.

## 4. Alcance

### 4.1 Dentro del alcance (MVP — Sprint 0 a 6)

| #   | Módulo                       | Alcance detallado                                                                                                                  |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Autenticación y usuarios** | Login JWT, roles ADMIN/CASHIER, alta/baja de usuarios, asignación a sucursal                                                       |
| 2   | **Catálogo**                 | CRUD de categorías, proveedores y productos; SKU, código de barras, unidad, precios, stock mínimo                                  |
| 3   | **Inventario**               | Stock por sucursal, movimientos (entrada/ajuste/merma), alertas de stock mínimo, kardex                                            |
| 4   | **Punto de venta**           | Búsqueda, carrito, descuentos, stock validation, métodos de pago, ticket, anulación, corte de caja                                 |
| 5   | **Compras**                  | Catálogo de proveedores, orden de compra (borrador/enviada/recibida/cancelada), recepción que suma stock, sugerencia de reposición |
| 6   | **Crédito (fiados)**         | Clientes, cargos a crédito, abonos, estado de cuenta, límite de crédito                                                            |
| 7   | **Multi-sucursal**           | Varias tiendas; stock y ventas aislados por sucursal                                                                               |
| 8   | **Reportes**                 | Ventas por periodo, productos más vendidos, rotación, márgenes, dashboard del día, exportación CSV                                 |

> Nota: los módulos 1–3 son el núcleo. Los módulos 4–8 completan el MVP en Sprint 3–6.

### 4.2 Fuera del alcance (post-MVP)

- Caducidades y alertas de producto por vencer.
- Merma como módulo independiente (en MVP es un tipo de movimiento).
- Lectura de códigos de barras por cámara (en MVP por teclado).
- Lista de precios diferenciada (mayoreo vs menudeo).
- Modo offline / PWA instalable.
- Aplicación móvil nativa.
- E-commerce, facturación electrónica, contabilidad completa, multi-idioma.

## 5. Stakeholders

| #   | Interesado                    | Rol en el proyecto                     | Interés principal                                     |
| --- | ----------------------------- | -------------------------------------- | ----------------------------------------------------- |
| 1   | **Dueño de la pulquería**     | Product Owner / usuario final primario | Control del negocio, saber cuánto gana y qué se vende |
| 2   | **Cajero / empleado**         | Usuario final secundario               | Vender rápido sin fricción                            |
| 3   | **Equipo de desarrollo**      | Implementadores                        | Entregar software mantenible y testeable              |
| 4   | **Administrador de sistemas** | Soporte de infraestructura             | Despliegue reproducible, backup y monitoreo           |

### 5.1 Necesidades por interesado

- **Dueño:** dashboards, reportes, alertas de stock, estado de fiados, corte de caja.
- **Cajero:** POS rápido, búsqueda por código de barras, modo sencillo, menos errores.
- **Administrador:** despliegue por Docker, backup diario, health checks.

## 6. Supuestos

| #   | Supuesto                                                                                |
| --- | --------------------------------------------------------------------------------------- |
| 1   | La tienda opera con 1 o 2 usuarios simultáneos; no se requiere alta concurrencia.       |
| 2   | El dueño tiene acceso a una computadora o tablet con navegador moderno.                 |
| 3   | Existe un servidor (VPS) con Linux para el despliegue, o se acepta operar en red local. |
| 4   | El inventario tiene entre 200 y 600 referencias.                                        |
| 5   | Se cuenta con cobertura de internet en la tienda para el uso diario.                    |
| 6   | Los proveedores no requieren integraciones; el pedido se gestiona dentro del sistema.   |
| 7   | La moneda es MXN y el idioma de la interfaz es español.                                 |

## 7. Restricciones

| #   | Restricción                   | Implicación                                                       |
| --- | ----------------------------- | ----------------------------------------------------------------- |
| 1   | Presupuesto limitado o nulo   | Se prioriza software libre y despliegue económico                 |
| 2   | Un solo desarrollador (1 dev) | Ritmo de ~2 semanas por sprint; alcance priorizado con MoSCoW     |
| 3   | Sin hardware de POS dedicado  | La venta se captura en navegador                                  |
| 4   | Datos fiscales sensibles      | Los reportes son de apoyo, no sustituyen declaración fiscal       |
| 5   | Riesgo de datos aislados      | El inventario es la fuente de verdad; nunca se edita stock a mano |

## 8. Criterios de Éxito del Proyecto

El proyecto se considera exitoso cuando:

1. Los 6 módulos del MVP están en producción y verificados por UAT.
2. El stock nunca queda negativo y cada movimiento es auditable (RNF-03, RNF-04).
3. Una venta se completa en ≤ 3 interacciones (RNF-07).
4. El corte de caja cuadra con el efectivo físico (precisión 100% con arqueo).
5. El sistema se despliega y actualiza con un solo comando documentado.
6. El backup se ejecuta y se puede restaurar probadamente.

## 9. Riesgos Principales

| #   | Riesgo                            | Probabilidad | Impacto | Mitigación                                                         |
| --- | --------------------------------- | ------------ | ------- | ------------------------------------------------------------------ |
| R-1 | Alcance de MVP demasiado amplio   | Alta         | Alto    | Priorización MoSCoW; S3 ya entrega un sistema vendible             |
| R-2 | Descuadre de inventario           | Media        | Alto    | Transacciones + bloqueo pesimista + kardex (RNF-03)                |
| R-3 | Datos de prueba irreales          | Media        | Medio   | Seed con ~50 productos reales de abarrotes                         |
| R-4 | El dueño no adopta la herramienta | Media        | Alto    | UAT temprano, Sprint 1 con el dueño validando catálogo             |
| R-5 | Internet intermitente             | Baja         | Medio   | Documentar operación local; modo offline es post-MVP               |
| R-6 | Sprint se desborda                | Media        | Medio   | Definition of Done estricta; revisar alcance en cada retrospectiva |

## 10. Glosario Rápido

Los términos de negocio (fiado, merma, corte de caja, etc.) están definidos en el
[Glosario (13)](13-glosario.md).

---

## 11. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                    |
| ------- | ----------- | ---------------- | ------------------------------ |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento |
