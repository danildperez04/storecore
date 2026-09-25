# PRD — MVP con MoSCoW — StoreCore

**Versión:** 1.0.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

Documento de Requisitos de Producto. Define el alcance del MVP con seis módulos
mediante priorización **MoSCoW** (_Must, Should, Could, Won't_).

---

## 1. Cómo leer este documento

| Prefijo  | Significado                                           |
| -------- | ----------------------------------------------------- |
| `RF-nn`  | Requerimiento funcional — qué hace el sistema         |
| `RNF-nn` | Requerimiento no funcional — cómo lo hace (calidad)   |
| `HU-nn`  | Historia de usuario — unidad de trabajo en el backlog |
| `P`      | Prioridad: `Must` / `Should` / `Could` / `Won't`      |

La trazabilidad completa de RF → HU → Sprint → prueba vive en la
[Matriz de Trazabilidad (09)](09-matriz-trazabilidad.md).

## 2. Reglas de negocio del dominio

Estas reglas gobiernan todos los módulos y se verifican con pruebas.

| #     | Regla                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------- |
| RN-1  | El stock de un producto es por sucursal. Un producto puede tener existencias en una tienda y cero en otra. |
| RN-2  | El stock **nunca** es negativo. Una venta que excede el stock se rechaza.                                  |
| RN-3  | El stock **nunca** se edita directamente. Toda variación pasa por un `stock_movement`.                     |
| RN-4  | Toda venta descuenta stock de forma atómica junto con el registro de la venta.                             |
| RN-5  | Recibir una orden de compra suma stock y genera los movimientos correspondientes en una sola transacción.  |
| RN-6  | El saldo de un cliente se deriva de la suma de sus `customer_transaction`. No se edita a mano.             |
| RN-7  | El total de una venta se deriva de sus `sale_item`. No se edita a mano.                                    |
| RN-8  | Un producto o proveedor no se elimina si tiene historial; se desactiva (`is_active = false`).              |
| RN-9  | El folio de venta es consecutivo por sucursal y no se reutiliza.                                           |
| RN-10 | Solo un `ADMIN` puede anular ventas, cerrar caja, gestionar usuarios y ver reportes financieros.           |

---

## 3. Requerimientos Funcionales

### 3.1 Autenticación, usuarios y sucursales

| ID    | Requerimiento                                                                                                                               | P    | Sprint | Riesgo |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------ | ------ |
| RF-01 | El sistema autentica al usuario con nombre de usuario y contraseña, y entrega un token JWT con expiración.                                  | Must | S0     | Alto   |
| RF-02 | El sistema restringe el acceso según el rol del usuario: `ADMIN` accede a todo; `CASHIER` solo a POS, consulta de stock y corte de su caja. | Must | S0     | Alto   |
| RF-03 | El `ADMIN` puede crear, editar y desactivar usuarios, asignándoles rol y sucursal.                                                          | Must | S0     | Medio  |
| RF-04 | El `ADMIN` puede crear, editar y desactivar sucursales.                                                                                     | Must | S0     | Medio  |
| RF-05 | El usuario puede cambiar su propia contraseña validateindo la actual.                                                                       | Must | S0     | Bajo   |
| RF-06 | El sistema registra quién realizó cada operación sensible (usuario, fecha y hora).                                                          | Must | S0     | Medio  |

### 3.2 Catálogo

| ID    | Requerimiento                                                                                                                                                                                                      | P    | Sprint | Riesgo |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ------ | ------ |
| RF-07 | El `ADMIN` gestiona categorías de producto, con soporte de jerarquía (subcategorías).                                                                                                                              | Must | S1     | Bajo   |
| RF-08 | El `ADMIN` gestiona proveedores con nombre, teléfono, correo, dirección y notas.                                                                                                                                   | Must | S1     | Bajo   |
| RF-09 | El `ADMIN` crea y edita productos con: SKU, código de barras, nombre, descripción, categoría, proveedor, unidad de medida (`UNIT` / `KG` / `LT`), precio de compra, precio de venta, stock mínimo y estado activo. | Must | S1     | Alto   |
| RF-10 | El sistema valida que el precio de venta sea mayor al de compra y que los campos obligatorios no estén vacíos.                                                                                                     | Must | S1     | Medio  |
| RF-11 | El catálogo se puede consultar con búsqueda por nombre, SKU o código de barras, y filtrar por categoría, proveedor y estado.                                                                                       | Must | S1     | Alto   |
| RF-12 | El sistema permite desactivar un producto sin eliminar su historial.                                                                                                                                               | Must | S1     | Medio  |
| RF-13 | El `ADMIN` fija el stock inicial de un producto por sucursal al crearlo.                                                                                                                                           | Must | S1     | Medio  |

### 3.3 Inventario

| ID    | Requerimiento                                                                                                                  | P    | Sprint | Riesgo |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ | ---- | ------ | ------ |
| RF-14 | El sistema muestra el stock de cada producto por sucursal.                                                                     | Must | S2     | Alto   |
| RF-15 | El `ADMIN` registra una entrada de mercancía (recepción manual o ajuste de incremento) con cantidad, motivo y referencia.      | Must | S2     | Alto   |
| RF-16 | El `ADMIN` registra un ajuste de inventario por diferencia de conteo físico, indicando el motivo.                              | Must | S2     | Medio  |
| RF-17 | El `ADMIN` registra una merma (producto dañado, vencido, consumo interno) con su motivo.                                       | Must | S2     | Medio  |
| RF-18 | El sistema genera una **alerta de stock bajo** cuando el stock de un producto es menor o igual a su stock mínimo.              | Must | S2     | Alto   |
| RF-19 | El sistema permite consultar el historial de movimientos (kardex) de un producto, con tipo, cantidad, motivo, usuario y fecha. | Must | S2     | Alto   |
| RF-20 | El sistema **nunca** permite que el stock quede negativo; rechaza la operación que lo provocaría.                              | Must | S2     | Alto   |

### 3.4 Punto de venta

| ID    | Requerimiento                                                                                                                   | P    | Sprint | Riesgo |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- | ---- | ------ | ------ |
| RF-21 | En el POS, el cajero busca productos por nombre o escanea el código de barras.                                                  | Must | S3     | Alto   |
| RF-22 | El cajero arma un carrito con cantidad por producto y el sistema calcula subtotal, descuento y total en tiempo real.            | Must | S3     | Alto   |
| RF-23 | El cajero aplica un descuento por venta, en monto o porcentaje.                                                                 | Must | S3     | Medio  |
| RF-24 | Al cobrar, el sistema valida que haya stock suficiente en la sucursal y rechaza la venta si no lo hay.                          | Must | S3     | Alto   |
| RF-25 | El cajero registra la venta con método de pago: efectivo, tarjeta o transferencia.                                              | Must | S3     | Alto   |
| RF-26 | El sistema genera un ticket de la venta con folio, productos, totales y método de pago, listo para imprimir.                    | Must | S3     | Medio  |
| RF-27 | El sistema asigna un folio consecutivo no reutilizable por sucursal a cada venta.                                               | Must | S3     | Medio  |
| RF-28 | El `ADMIN` puede anular una venta; el sistema devuelve el stock y conserva la venta marcada como anulada.                       | Must | S3     | Alto   |
| RF-29 | El cajero abre y cierra su caja con arqueo; el sistema compara el efectivo declarado contra el esperado y guarda la diferencia. | Must | S3     | Alto   |

### 3.5 Compras a proveedores

| ID    | Requerimiento                                                                                              | P    | Sprint | Riesgo |
| ----- | ---------------------------------------------------------------------------------------------------------- | ---- | ------ | ------ |
| RF-30 | El `ADMIN` crea una orden de compra a un proveedor, en estado `DRAFT`, con sus productos y cantidades.     | Must | S4     | Alto   |
| RF-31 | El `ADMIN` marca la orden como enviada (`ORDERED`) al confirmar el pedido al proveedor.                    | Must | S4     | Medio  |
| RF-32 | El `ADMIN` recibe la mercancía, total o parcialmente; el sistema suma el stock y registra los movimientos. | Must | S4     | Alto   |
| RF-33 | El `ADMIN` cancela una orden que ya no se va a recibir.                                                    | Must | S4     | Bajo   |
| RF-34 | El sistema lista el historial de órdenes de compra por proveedor, estado y periodo.                        | Must | S4     | Medio  |
| RF-35 | El sistema sugiere qué productos reponer, basándose en el stock actual frente al mínimo y la rotación.     | Must | S4     | Medio  |

### 3.6 Crédito a clientes (fiados)

| ID    | Requerimiento                                                                           | P      | Sprint | Riesgo |
| ----- | --------------------------------------------------------------------------------------- | ------ | ------ | ------ |
| RF-36 | El `ADMIN` gestiona clientes con nombre, teléfono y límite de crédito.                  | Must   | S5     | Medio  |
| RF-37 | En el POS, el cajero selecciona un cliente y registra la venta a crédito.               | Must   | S5     | Alto   |
| RF-38 | El sistema impideOtorgar crédito si el saldo del cliente supera su límite.              | Must   | S5     | Alto   |
| RF-39 | El `ADMIN` registra un abono a cuenta y lo descuenta del saldo del cliente.             | Must   | S5     | Alto   |
| RF-40 | El sistema muestra el estado de cuenta del cliente: cargos, abonos y saldo actual.      | Must   | S5     | Medio  |
| RF-41 | El sistema lista los clientes con saldo pendiente, ordenado de mayor a menor.           | Must   | S5     | Medio  |
| RF-42 | El sistema marca el adeudo como vencido cuando la venta a crédito tiene más de 30 días. | Should | S5     | Bajo   |

### 3.7 Reportes y dashboard

| ID    | Requerimiento                                                                                                      | P      | Sprint | Riesgo |
| ----- | ------------------------------------------------------------------------------------------------------------------ | ------ | ------ | ------ |
| RF-43 | El `ADMIN` consulta el dashboard con ventas del día, tickets, productos bajo mínimo, órdenes pendientes y adeudos. | Must   | S6     | Alto   |
| RF-44 | El sistema genera el reporte de ventas por periodo, agrupado por día.                                              | Must   | S6     | Alto   |
| RF-45 | El sistema genera el reporte de productos más vendidos por periodo.                                                | Must   | S6     | Medio  |
| RF-46 | El sistema genera el reporte de productos con mayor rotación (unidades vendidas / stock promedio).                 | Must   | S6     | Medio  |
| RF-47 | El sistema genera el reporte de márgenes de utilidad por producto (precio de venta − precio de compra).            | Must   | S6     | Medio  |
| RF-48 | El sistema genera el reporte de inventario valorizado (cantidad × precio de compra) por sucursal.                  | Should | S6     | Bajo   |
| RF-49 | El usuario puede exportar cualquier reporte a CSV.                                                                 | Should | S6     | Bajo   |
| RF-50 | El sistema genera el reporte de corte de caja por periodo, con ventas por método de pago.                          | Must   | S6     | Alto   |

### 3.8 Salud del sistema

| ID    | Requerimiento                                                                         | P    | Sprint | Riesgo |
| ----- | ------------------------------------------------------------------------------------- | ---- | ------ | ------ |
| RF-51 | El sistema expone un endpoint de salud que verifica la conexión con la base de datos. | Must | S0     | Medio  |

## 4. Requerimientos No Funcionales

| ID     | Categoría      | Requerimiento                                                                                                                             | P      | Verificación                           |
| ------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------- |
| RNF-01 | Rendimiento    | Las operaciones CRUD de la API responden en menos de 500 ms con el conjunto de datos de referencia.                                       | Must   | Prueba de carga                        |
| RNF-02 | Rendimiento    | La pantalla principal del POS carga en menos de 1.5 s (P95) en la red de la tienda.                                                       | Must   | Medición en dispositivo real           |
| RNF-03 | Integridad     | El stock nunca queda negativo. La validación y el descuento ocurren dentro de una transacción con bloqueo pesimista.                      | Must   | Prueba de concurrencia                 |
| RNF-04 | Trazabilidad   | Todo cambio de stock queda registrado en `stock_movement` con tipo, cantidad, motivo, usuario y fecha.                                    | Must   | Prueba unitaria de servicio            |
| RNF-05 | Seguridad      | Las contraseñas se almacenan con hash bcrypt (12 rondas). El JWT tiene expiración configurable (por defecto 8 h).                         | Must   | Inspección de esquema y prueba         |
| RNF-06 | Seguridad      | Toda entrada se valida en el backend con `class-validator` y en el frontend con `zod` antes de enviarse.                                  | Must   | Prueba de validación                   |
| RNF-07 | Usabilidad     | Una venta completa se realiza en 3 o menos interacciones desde la pantalla de POS.                                                        | Must   | Prueba de usabilidad con el cajero     |
| RNF-08 | Mantenibilidad | La cobertura de pruebas del backend es igual o superior al 70 % de líneas.                                                                | Must   | Reporte de cobertura en CI             |
| RNF-09 | Portabilidad   | El sistema se despliega y levanta completo con Docker Compose en un solo comando.                                                         | Must   | Prueba del procedimiento de despliegue |
| RNF-10 | Disponibilidad | Los tres contenedores exponen health check y se reinician automáticamente ante fallo.                                                     | Must   | Inspección de `docker-compose.yml`     |
| RNF-11 | Auditoría      | Las operaciones sensibles (venta, anulación, ajuste de stock, cierre de caja, cambio de contraseña) registran el usuario que las ejecutó. | Must   | Prueba de auditoría                    |
| RNF-12 | Accesibilidad  | Los colores críticos (stock bajo, stock crítico, error) cumplen contraste AA contra su fondo.                                             | Should | Inspección de la paleta                |
| RNF-13 | Localización   | Los montos se muestran en MXN con formato `1,234.50` y las fechas en formato `dd/mm/aaaa`.                                                | Must   | Prueba de formateo                     |
| RNF-14 | Compatibilidad | Funciona en las dos versiones principales de Chrome, Edge, Firefox y Safari.                                                              | Should | Prueba manual                          |
| RNF-15 | Idioma         | Toda la interfaz de usuario está en español.                                                                                              | Must   | Revisión de la interfaz                |
| RNF-16 | Respaldo       | El procedimiento de backup con `pg_dump` está documentado y se verificó una restauración exitosa.                                         | Must   | Prueba de restore                      |

## 5. Clasificación MoSCoW

### 5.1 Must (MVP — Sprint 0 a 6)

Es el conjunto mínimo para que el sistema sea operativo y atribuible al negocio.

| Módulo         | Requerimientos Must                                           |
| -------------- | ------------------------------------------------------------- |
| Autenticación  | RF-01, RF-02, RF-03, RF-04, RF-05, RF-06                      |
| Catálogo       | RF-07, RF-08, RF-09, RF-10, RF-11, RF-12, RF-13               |
| Inventario     | RF-14, RF-15, RF-16, RF-17, RF-18, RF-19, RF-20               |
| Punto de venta | RF-21, RF-22, RF-23, RF-24, RF-25, RF-26, RF-27, RF-28, RF-29 |
| Compras        | RF-30, RF-31, RF-32, RF-33, RF-34, RF-35                      |
| Crédito        | RF-36, RF-37, RF-38, RF-39, RF-40, RF-41                      |
| Reportes       | RF-43, RF-44, RF-45, RF-46, RF-47, RF-50                      |
| Salud          | RF-51                                                         |

### 5.2 Should (post-MVP inmediato)

Importantes, pero el sistema funciona sin ellos en la primera entrega.

| ID     | Requerimiento                          | Sprint |
| ------ | -------------------------------------- | ------ |
| RF-42  | Marcar adeudo vencido a más de 30 días | S5     |
| RF-48  | Reporte de inventario valorizado       | S6     |
| RF-49  | Exportar reportes a CSV                | S6     |
| RNF-12 | Contraste AA en colores críticos       | S6     |

### 5.3 Could (post-MVP ampliado)

Importancia media. Se programan según capacidad y prioridad del dueño.

| ID     | Requerimiento                                                   |
| ------ | --------------------------------------------------------------- |
| RF-53  | Alertas de caducidad de producto                                |
| RF-54  | Lectura de código de barras por cámara                          |
| RF-55  | Lista de precios mayoreo / menudeo                              |
| RF-56  | Sugerencia inteligente de quantities de compra                  |
| RF-57  | Perfil de empresa configurable (logo, nombre, RFC) en el ticket |
| RNF-17 | Modo offline con sincronización diferida (PWA)                  |

### 5.4 Won't (fuera de alcance)

No se contempla en este ciclo. Requieren decisiones de arquitectura y presupuesto propios.

| Alcance excluido                             |
| -------------------------------------------- |
| E-commerce y venta en línea                  |
| Facturación electrónica (CFDI / SAT)         |
| Contabilidad completa (balanza, pólizas,ISR) |
| Aplicación móvil nativa (iOS / Android)      |
| Integración con hardware de POS dedicado     |
| Soporte multi-idioma                         |
| Integraciones con proveedores por API        |

## 6. Fuera del alcance del MVP (detalle)

| #   | Ítem                          | Razón                                                                                   | Considerado en |
| --- | ----------------------------- | --------------------------------------------------------------------------------------- | -------------- |
| 1   | Facturación electrónica       | Requiere un proveedor de certificación autorizado por el SAT; no es el problema central | Post-MVP       |
| 2   | E-commerce                    | Cambia el modelo de negocio y el alcance del sistema                                    | Won't          |
| 3   | App móvil nativa              | El POS web en tablet cubre el caso de uso                                               | Won't          |
| 4   | Módulo de merma independiente | Se resuelve como tipo de movimiento dentro de inventario                                | Must (RF-17)   |
| 5   | Multi-idioma                  | La tienda opera en español                                                              | Won't          |
| 6   | Integraciones con proveedores | No hay API ni acuerdo con proveedores                                                   | Won't          |

## 7. Criterios de Aceptación del MVP

El MVP se acepta cuando:

1. Todos los requerimientos `Must` están implementados y verificados.
2. Los requerimientos `Should` de RF-42, RF-48 y RF-49 están implementados o formalmente diferidos.
3. Se ejecutó la [checklist UAT (15)](15-checklist-uat-s1.md) con el dueño y se detallaron los defectos.
4. Los defectos de severidad alta y crítica están cerrados.
5. El sistema se desplegó con el procedimiento de la [Guía de Despliegue (11)](11-guia-despliegue.md).
6. Se verificó backup y restauración (RNF-16).
7. Se documentó la cobertura de pruebas igual o superior al 70 % (RNF-08).

---

## 8. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                    |
| ------- | ----------- | ---------------- | ------------------------------ |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento |
