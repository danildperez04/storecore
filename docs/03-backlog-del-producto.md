# Backlog del Producto — StoreCore

**Versión:** 1.0.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

---

## 1. Convenciones

| Elemento            | Convención                                                     |
| ------------------- | -------------------------------------------------------------- |
| ID de épica         | `E-n`                                                          |
| ID de historia      | `HU-nn`                                                        |
| Formato de historia | `Como [rol], quiero [acción], para [beneficio]`                |
| Puntos              | Escala de Fibonacci: 1, 2, 3, 5, 8, 13                         |
| Estado              | `PENDIENTE` · `EN CURSO` · `EN UAT` · `TERMINADO` · `DIFERIDO` |

**Roles de usuario:** `Dueño` (propietario), `Administrador` (admin con permisos
administrativos), `Cajero` (quien cobra en mostrador).

---

## 2. Épicas

| Épica | Nombre                               | Módulo      | Sprints | Puntos         | Estado    |
| ----- | ------------------------------------ | ----------- | ------- | -------------- | --------- |
| E-1   | Cimientos e infraestructura          | Transversal | S0      | 21             | PENDIENTE |
| E-2   | Autenticación, usuarios y sucursales | Transversal | S0      | 13             | PENDIENTE |
| E-3   | Catálogo de productos                | Catálogo    | S1      | 21             | PENDIENTE |
| E-4   | Inventario y alertas                 | Inventario  | S2      | 21             | PENDIENTE |
| E-5   | Punto de venta                       | Ventas      | S3      | 34             | PENDIENTE |
| E-6   | Compras a proveedores                | Compras     | S4      | 21             | PENDIENTE |
| E-7   | Clientes y crédito                   | Crédito     | S5      | 21             | PENDIENTE |
| E-8   | Reportes y cortes de caja            | Reportes    | S6      | 26             | PENDIENTE |
| E-9   | UAT y estabilización                 | Transversal | S7      | 13             | PENDIENTE |
|       |                                      |             |         | **Total: 191** |           |

---

## 3. Épica E-1 — Cimientos e infraestructura

| ID    | Historia                                                                                                                                  | Puntos | Requerimientos | Estado    |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------- | --------- |
| HU-01 | Como desarrollador, quiero un monorepo con `backend` y `frontend` en pnpm workspaces, para tener una sola instalación y una sola versión. | 3      | RNF-09         | PENDIENTE |
| HU-02 | Como desarrollador, quiero Dockerfiles multi-stage y `docker-compose`, para levantar el sistema completo con un solo comando.             | 5      | RNF-09, RNF-10 | PENDIENTE |
| HU-03 | Como desarrollador, quiero un pipeline de CI con lint, build y pruebas, para no integrar código roto.                                     | 5      | RNF-08         | PENDIENTE |
| HU-04 | Como desarrollador, quiero commitlint y Husky configurados, para que la convención de commits se cumpla sola.                             | 3      | —              | PENDIENTE |
| HU-05 | Como administrador del sistema, quiero un endpoint de salud que verifique la base de datos, para saber si el servicio está vivo.          | 2      | RF-51          | PENDIENTE |
| HU-06 | Como desarrollador, quiero seeders con ~50 productos reales de abarrotes, para poder probar con datos creíbles.                           | 3      | —              | PENDIENTE |

## 4. Épica E-2 — Autenticación, usuarios y sucursales

| ID    | Historia                                                                                                                                | Puntos | Requerimientos | Estado    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------- | --------- |
| HU-07 | Como usuario, quiero iniciar sesión con mi nombre de usuario y contraseña, para acceder al sistema.                                     | 3      | RF-01, RNF-05  | PENDIENTE |
| HU-08 | Como usuario, quiero que el sistema me envíe a la pantalla de inicio de sesión si mi token expira, para saber que debo volver a entrar. | 2      | RF-01          | PENDIENTE |
| HU-09 | Como Administrador, quiero restringir el acceso por rol, para que un cajero no pueda modificar el catálogo ni ver reportes financieros. | 5      | RF-02          | PENDIENTE |
| HU-10 | Como Administrador, quiero crear, editar y desactivar usuarios con su rol y sucursal, para controlar quién entra y a dónde.             | 3      | RF-03          | PENDIENTE |
| HU-11 | Como Administrador, quiero crear, editar y desactivar sucursales, para operar más de una tienda con el mismo sistema.                   | 3      | RF-04          | PENDIENTE |
| HU-12 | Como usuario, quiero cambiar mi contraseña validateindo la actual, para mantener mi cuenta segura.                                      | 2      | RF-05          | PENDIENTE |

## 5. Épica E-3 — Catálogo de productos

| ID    | Historia                                                                                                                               | Puntos | Requerimientos | Estado   |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------- | -------- |
| HU-13 | Como Administrador, quiero gestionar categorías con subcategorías, para organizar el catálogo.                                         | 3      | RF-07          | EN CURSO |
| HU-14 | Como Administrador, quiero gestionar proveedores con sus datos de contacto, para saber a quién pedirle cada producto.                  | 3      | RF-08          | EN CURSO |
| HU-15 | Como Administrador, quiero crear productos con SKU, código de barras, unidad, precios y stock mínimo, para tener el catálogo completo. | 5      | RF-09, RF-10   | EN CURSO |
| HU-16 | Como Administrador, quiero editar y desactivar productos sin perder su historial, para no romper las ventas ya registradas.            | 3      | RF-12          | EN CURSO |
| HU-17 | Como usuario, quiero buscar productos por nombre, SKU o código de barras, para encontrarlos rápido.                                    | 5      | RF-11          | EN CURSO |
| HU-18 | Como usuario, quiero filtrar el catálogo por categoría, proveedor y estado, para reducir la lista a lo que me interesa.                | 3      | RF-11          | EN CURSO |
| HU-19 | Como Administrador, quiero fijar el stock inicial por sucursal al crear un producto, para empezar con inventario real.                 | 2      | RF-13          | EN CURSO |

## 6. Épica E-4 — Inventario y alertas

| ID    | Historia                                                                                                                         | Puntos | Requerimientos | Estado    |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------- | --------- |
| HU-20 | Como usuario, quiero ver el stock de cada producto por sucursal, para saber qué hay disponible.                                  | 3      | RF-14          | PENDIENTE |
| HU-21 | Como Administrador, quiero registrar una entrada de mercancía con motivo y referencia, para aumentar el stock de forma trazable. | 5      | RF-15, RNF-04  | PENDIENTE |
| HU-22 | Como Administrador, quiero registrar un ajuste por diferencia de conteo físico, para corregir el stock real.                     | 5      | RF-16          | PENDIENTE |
| HU-23 | Como Administrador, quiero registrar una merma con su motivo, para que el producto dañado o vencido no esté en el inventario.    | 3      | RF-17          | PENDIENTE |
| HU-24 | Como usuario, quiero ver una alerta cuando un producto baje de su stock mínimo, para saber qué pedir antes de que se agote.      | 5      | RF-18          | PENDIENTE |
| HU-25 | Como Administrador, quiero ver el kardex de un producto con todos sus movimientos, para auditar por qué cambió el stock.         | 5      | RF-19, RNF-04  | PENDIENTE |
| HU-26 | Como sistema, quiero rechazar cualquier operación que deje el stock negativo, para mantener el inventario íntegro.               | 5      | RF-20, RNF-03  | PENDIENTE |

## 7. Épica E-5 — Punto de venta

| ID    | Historia                                                                                                                       | Puntos | Requerimientos | Estado    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ | ------ | -------------- | --------- |
| HU-27 | Como Cajero, quiero buscar un producto por código de barras, para venderlo rápido sin escribir.                                | 5      | RF-21          | PENDIENTE |
| HU-28 | Como Cajero, quiero armar un carrito con la cantidad de cada producto y ver el total en tiempo real, para saber cuánto cobrar. | 5      | RF-22          | PENDIENTE |
| HU-29 | Como Cajero, quiero aplicar un descuento por monto o porcentaje, para ajustar la venta cuando el cliente lo pida.              | 3      | RF-23          | PENDIENTE |
| HU-30 | Como sistema, quiero validar que haya stock suficiente al cobrar, para no vender lo que no se tiene.                           | 5      | RF-24, RNF-03  | PENDIENTE |
| HU-31 | Como Cajero, quiero registrar la venta con efectivo, tarjeta o transferencia, para cerrar la operación correctamente.          | 3      | RF-25          | PENDIENTE |
| HU-32 | Como Cajero, quiero imprimir el ticket con folio, productos y totales, para entregar comprobante al cliente.                   | 3      | RF-26, RF-27   | PENDIENTE |
| HU-33 | Como Administrador, quiero anular una venta que devolviendo el stock, para corregir errores de cobro.                          | 5      | RF-28          | PENDIENTE |
| HU-34 | Como Cajero, quiero abrir y cerrar mi caja con arqueo y diferencia, para saber cuánto dinero quedó.                            | 5      | RF-29          | PENDIENTE |

## 8. Épica E-6 — Compras a proveedores

| ID    | Historia                                                                                                         | Puntos | Requerimientos | Estado    |
| ----- | ---------------------------------------------------------------------------------------------------------------- | ------ | -------------- | --------- |
| HU-35 | Como Administrador, quiero crear una orden de compra en borrador a un proveedor, para preparar el pedido.        | 5      | RF-30          | PENDIENTE |
| HU-36 | Como Administrador, quiero marcar la orden como enviada, para dejar registro de que ya se pidió.                 | 2      | RF-31          | PENDIENTE |
| HU-37 | Como Administrador, quiero recibir la mercancía de una orden, para que el stock suba solo al llegar el producto. | 5      | RF-32, RN-5    | PENDIENTE |
| HU-38 | Como Administrador, quiero cancelar una orden que ya no voy a recibir, para no dejar pedidos fantasma.           | 2      | RF-33          | PENDIENTE |
| HU-39 | Como Administrador, quiero ver el historial de órdenes por proveedor y periodo, para saber qué se pidió.         | 3      | RF-34          | PENDIENTE |
| HU-40 | Como Administrador, quiero ver qué productos conviene reponer, para decidir el siguiente pedido con datos.       | 4      | RF-35          | PENDIENTE |

## 9. Épica E-7 — Clientes y crédito

| ID    | Historia                                                                                                                      | Puntos | Requerimientos | Estado    |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- | ------ | -------------- | --------- |
| HU-41 | Como Administrador, quiero gestionar clientes con teléfono y límite de crédito, para saber a quién fiar y hasta cuánto.       | 3      | RF-36          | PENDIENTE |
| HU-42 | Como Cajero, quiero registrar una venta a crédito a un cliente, para atender a quien compra fiado.                            | 5      | RF-37          | PENDIENTE |
| HU-43 | Como sistema, quiero impedir crédito si el cliente rebasa su límite, para no arriesgarme con un adeudo grande.                | 5      | RF-38          | PENDIENTE |
| HU-44 | Como Administrador, quiero registrar un abono a cuenta, para ir reduciendo el adeudo.                                         | 3      | RF-39          | PENDIENTE |
| HU-45 | Como Administrador, quiero ver el estado de cuenta de un cliente con cargos, abonos y saldo, para saber exactamente qué debe. | 3      | RF-40          | PENDIENTE |
| HU-46 | Como Administrador, quiero ver los clientes con adeudo ordenado de mayor a menor, para priorizar la cobranza.                 | 2      | RF-41          | PENDIENTE |

## 10. Épica E-8 — Reportes y cortes de caja

| ID    | Historia                                                                                                                                                 | Puntos | Requerimientos | Estado    |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------- | --------- |
| HU-47 | Como Dueño, quiero un dashboard con ventas del día, productos bajo mínimo, órdenes pendientes y adeudos, para saber el estado del negocio de un vistazo. | 5      | RF-43          | PENDIENTE |
| HU-48 | Como Dueño, quiero el reporte de ventas por periodo agrupado por día, para ver cómo van las ventas.                                                      | 3      | RF-44          | PENDIENTE |
| HU-49 | Como Dueño, quiero el reporte de productos más vendidos, para decidir qué mantener en existencia.                                                        | 3      | RF-45          | PENDIENTE |
| HU-50 | Como Dueño, quiero el reporte de productos con mayor rotación, para saber qué se agota más rápido.                                                       | 3      | RF-46          | PENDIENTE |
| HU-51 | Como Dueño, quiero el reporte de márgenes de utilidad por producto, para saber qué deja más ganancia.                                                    | 3      | RF-47          | PENDIENTE |
| HU-52 | Como Dueño, quiero el reporte de ventas por método de pago en el corte, para saber cuánto fue efectivo, tarjeta o transferencia.                         | 3      | RF-50          | PENDIENTE |
| HU-53 | Como Dueño, quiero exportar los reportes a CSV, para analizarlos en otra herramienta.                                                                    | 2      | RF-49          | PENDIENTE |

## 11. Épica E-9 — UAT y estabilización

| ID    | Historia                                                                                                     | Puntos | Requerimientos | Estado    |
| ----- | ------------------------------------------------------------------------------------------------------------ | ------ | -------------- | --------- |
| HU-54 | Como Dueño, quiero ejecutar la checklist UAT con el sistema en mi tienda, para confirmar que sirve.          | 5      | —              | PENDIENTE |
| HU-55 | Como equipo, quiero corregir los defectos de UAT de severidad alta y crítica, para tener un sistema estable. | 5      | —              | PENDIENTE |
| HU-56 | Como equipo, quiero verificar backup y restauración, para no perder datos de una tienda.                     | 3      | RNF-16         | PENDIENTE |

---

## 12. Resumen por sprint

| Sprint   | Épicas   | Historias        | Puntos  | Versión |
| -------- | -------- | ---------------- | ------- | ------- |
| Sprint 0 | E-1, E-2 | HU-01 a HU-12    | 34      | `0.1.0` |
| Sprint 1 | E-3      | HU-13 a HU-19    | 24      | `0.2.0` |
| Sprint 2 | E-4      | HU-20 a HU-26    | 31      | `0.3.0` |
| Sprint 3 | E-5      | HU-27 a HU-34    | 34      | `0.4.0` |
| Sprint 4 | E-6      | HU-35 a HU-40    | 19      | `0.5.0` |
| Sprint 5 | E-7      | HU-41 a HU-46    | 21      | `0.6.0` |
| Sprint 6 | E-8      | HU-47 a HU-53    | 22      | `0.7.0` |
| Sprint 7 | E-9      | HU-54 a HU-56    | 13      | `1.0.0` |
|          |          | **56 historias** | **198** |         |

> La suma por épica (191) y la suma por sprint (198) difieren porque la estimación
> se recalcula al inicio de cada sprint. La fuente de verdad para el commitment es
> el Sprint Review, no este documento.

## 13. Definición de terminado (por historia)

Una historia está `TERMINADO` cuando cumple **todas** estas condiciones:

- [ ] El código está implementado y combinado en `develop`.
- [ ] `lint`, `typecheck` y `build` pasan sin errores.
- [ ] Hay pruebas nuevas que cubren la historia y pasan.
- [ ] Si toca el esquema, hay migración creada y probada.
- [ ] Si toca la API, la documentación OpenAPI está actualizada.
- [ ] `docs/10-esquema-base-de-datos.md` refleja cualquier cambio de esquema.
- [ ] La matriz de trazabilidad marca la historia y su estado.
- [ ] El mensaje de commit referencia `Refs: HU-nn / RF-nn`.
- [ ] El PR tiene al menos una aprobación.

## 14. Risks y dependencias

| Historia | Depende de   | Riesgo |
| -------- | ------------ | ------ |
| HU-15    | HU-13, HU-14 | Media  |
| HU-21    | HU-20        | Media  |
| HU-27    | HU-17, HU-20 | Alta   |
| HU-30    | HU-26        | Alta   |
| HU-31    | HU-30        | Alta   |
| HU-32    | HU-31        | Media  |
| HU-37    | HU-21, HU-35 | Alta   |
| HU-42    | HU-31, HU-41 | Media  |
| HU-43    | HU-42        | Media  |
| HU-52    | HU-34, HU-31 | Media  |

## 15. Fuera del backlog

Diferidos a post-MVP según la sección
[5.3 Could del PRD](02-prd-mvp-moscow.md#53-could-post-mvp-ampliado):

| ID diferida | Descripción                                    |
| ----------- | ---------------------------------------------- |
| RF-42       | Marcar adeudo vencido a más de 30 días         |
| RF-48       | Reporte de inventario valorizado               |
| RF-53       | Alertas de caducidad                           |
| RF-54       | Lectura de código de barras por cámara         |
| RF-55       | Lista de precios mayoreo / menudeo             |
| RF-56       | Sugerencia inteligente de cantidades de compra |
| RF-57       | Perfil de empresa en el ticket                 |
| RNF-17      | Modo offline con sincronización diferida (PWA) |

---

## 16. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                    |
| ------- | ----------- | ---------------- | ------------------------------ |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento |
