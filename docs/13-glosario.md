# Glosario — StoreCore

**Versión:** 1.0.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

Términos de negocio y técnicos usados en la documentación y en el código.

---

## 1. Términos de Negocio

### Abono

Pago parcial que un cliente realiza sobre su cuenta corriente. Reduce el saldo a
favor de la tienda. Se registra como `customer_transaction` de tipo `PAYMENT`.
Ver RF-39.

### Adeudo

Saldo pendiente de un cliente con la tienda. Equivale a su saldo cuando es positivo.
Ver RF-41.

### Ajuste de inventario

Corrección de la cantidad registrada de un producto frente a la cantidad contada
físicamente. Se registra como movimiento de tipo `ADJUSTMENT`, positivo o negativo.
Ver RF-16.

### Arqueo de caja

Comparación entre el efectivo que el sistema espera y el efectivo que el cajero
declara al cerrar su turno. La diferencia entre ambos es el sobrante o faltante.
Ver RF-29.

### Branch

Sucursal. Cada punto de venta de la tienda es una sucursal, con su propio stock y
sus propias ventas. En este documento se usa **sucursal**; en el código, `branch`.
Ver RF-04.

### Cargo

Importe que se suma al adeudo de un cliente por una venta a crédito. Se registra
como `customer_transaction` de tipo `CHARGE`. Contraparte del abono.

### Cash Shift

Turno de caja. Apertura con un monto inicial, ventas registradas, cierre con arqueo
y diferencia. En este documento se usa **corte de caja**; en el código, `cash_shift`.
Ver RF-29.

### Cierre de caja

Fin del turno de un cajero: se cuenta el efectivo, el sistema calcula lo esperado y
se registra la diferencia. Ver RF-29.

### Código de barras

Identificador numérico impreso en el empaque del producto, que permite escanearlo
en el punto de venta en lugar de escribir su nombre. Ver RF-21.

### Contabilidad de stock

Registro de todos los movimientos que afectan la cantidad de un producto. En este
proyecto se materializa en la tabla `stock_movement`, que funciona como un libro
mayor: los saldos se derivan de los movimientos, nunca se editan a mano.
Ver RN-3, RNF-04.

### Credenciales

Par de nombre de usuario y contraseña con el que una persona inicia sesión.

### Cupo de crédito

Máximo monto de dinero que la tienda está dispuesta a fiarle a un cliente. Al
superarlo, el sistema rechaza nuevas ventas a crédito. Ver RF-38.

### Devolución

Anulación de una venta ya registrada. El sistema devuelve el stock al inventario
mediante un movimiento de tipo `RETURN` y conserva la venta original marcada como
`CANCELLED`. Ver RF-28.

### Existencia

Cantidad física de un producto disponible en una sucursal en un momento dado. Se
almacena en `product_stock.quantity` y se deriva de los movimientos.
Ver RF-14.

### Fiado

Venta a crédito: el cliente se lleva el producto y paga después. En el sistema se
registra como una venta con `payment_method = CREDIT` que genera un cargo en la
cuenta del cliente. Ver RF-37.

### Folio

Número consecutivo que identifica a una venta o a una orden de compra. Se genera
por sucursal y no se reutiliza, ni siquiera tras una anulación. Ver RF-27.

### Kardex

Historial completo de los movimientos de un producto: cada entrada, salida, ajuste
y merma, con su cantidad, motivo, usuario y fecha. Ver RF-19.

### Margen de utilidad

Diferencia entre el precio de venta y el costo del producto, expresada en monto y
en porcentaje. Se calcula con el costo congelado en el momento de la venta, para
que los reportes históricos no cambien cuando el precio del producto se actualiza.
Ver RF-47.

### Merma

Pérdida de mercadería por daño, caducidad, robo o consumo interno. Se registra como
movimiento de tipo `WASTE` y reduce la existencia. Ver RF-17.

### Método de pago

Forma en que el cliente paga: efectivo, tarjeta, transferencia o crédito.
Ver RF-25.

### MoSCoW

Método de priorización que clasifica requerimientos en **Must** (necesarios para el
MVP), **Should** (importantes pero no bloqueantes), **Could** (deseables) y
**Won't** (fuera de alcance). Ver el
[PRD (02)](02-prd-mvp-moscow.md#5-clasificación-moscow).

### Movimiento de stock

Registro de una variación en la existencia de un producto. Tiene un tipo, una
cantidad, un motivo, un usuario y una fecha. Es la única forma de cambiar el stock.
Ver RF-15 a RF-17, RNF-04.

### Orden de compra

Documento que registra lo que se le pidió a un proveedor. Nace en `DRAFT`, pasa a
`ORDERED` al enviarse y a `RECEIVED` al llegar la mercancía. Ver RF-30 a RF-32.

### Punto de venta (POS)

Pantalla donde el cajero registra una venta: busca productos, arma un carrito,
aplica descuentos y cobra. Ver RF-21 a RF-26.

### Producto inactivo

Producto que ya no se vende pero que se conserva en el sistema porque tiene
historial de ventas o de compras. No se borra, se desactiva. Ver RF-12, RN-8.

### Recepción de mercancía

Proceso de registrar la llegada de un pedido. Suma el stock recibido y genera los
movimientos correspondientes, todo en una sola transacción. Ver RF-32.

### Rotación

Relación entre las unidades vendidas de un producto y su inventario promedio. Un
producto con rotación alta se agota rápido y necesita reposición constante.
Ver RF-46.

### Saldo

Deuda actual de un cliente. Se deriva sumando los cargos y restando los abonos; no
se almacena en la tabla de clientes. Ver RF-40, RN-6.

### SKU

Código interno que StoreCore asigna a cada producto para identificarlo. Lo define
la tienda, a diferencia del código de barras, que lo define el fabricante.

### Sobrante

Efectivo que hay en caja al cerrar y que el sistema no esperaba. Es una diferencia
positiva en el arqueo.

### Sucursal

Punto de venta físico con su propio stock, sus propias ventas y su propio turno de
caja. En el código, la tabla `branch`.

### Ticket

Comprobante que se entrega al cliente tras una venta: folio, productos, cantidades,
subtotal, descuento, total, método de pago y fecha. Ver RF-26.

### Turno de caja

Periodo de trabajo de un cajero, desde la apertura hasta el cierre de su caja.

---

## 2. Términos Técnicos

| Término                       | Significado                                                                                                                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API**                       | Interfaz de programación. En StoreCore, la superficie HTTP REST del backend.                                                                                                                   |
| **Backlog**                   | Lista ordenada de todo lo que falta por hacer. Se divide en Product Backlog y Sprint Backlog.                                                                                                  |
| **Backlog Grooming**          | Revisión del backlog antes del Planning, para_estimar y aclarar historias.                                                                                                                     |
| **Build**                     | Proceso de compilar el código fuente a archivos ejecutables.                                                                                                                                   |
| **CI**                        | Integración continua. Ejecución automática de pruebas en cada cambio. Ver el pipeline de GitHub Actions.                                                                                       |
| **Code Review**               | Revisión del código de otra persona antes de combinarlo. Obligatoria en StoreCore.                                                                                                             |
| **Commit**                    | Registro versionado de un cambio. Sigue la [convención de commits](06-convencion-de-commits.md).                                                                                               |
| **Controller**                | Capa de la API que recibe peticiones HTTP y delega en un servicio. No contiene lógica de negocio.                                                                                              |
| **CD**                        | Entrega continua. Despliegue automatizado tras pasar las pruebas. En StoreCore es manual y documentado, no automatizado.                                                                       |
| **Conventional Commits**      | Estándar de mensajes de commit con la forma `tipo(alcance): descripción`.                                                                                                                      |
| **CRUD**                      | Create, Read, Update, Delete. Operaciones básicas sobre una entidad.                                                                                                                           |
| **Definition of Done**        | Lista de condiciones que debe cumplir una historia para considerarse terminada.                                                                                                                |
| **Dependency Injection (DI)** | Patrón donde los componentes reciben sus dependencias en lugar de construirlas. NestJS lo resuelve con el contenedor de Nest.                                                                  |
| **DTO**                       | _Data Transfer Object_. Objeto que define la forma de un dato que entra o sale de la API, con su validación.                                                                                   |
| **DTO de respuesta**          | Forma exacta que devuelve un endpoint. Importante para el tipado del frontend.                                                                                                                 |
| **Entity**                    | Clase de TypeORM que mapea una tabla de la base de datos.                                                                                                                                      |
| **Endpoint**                  | Ruta HTTP concreta, como `POST /api/v1/sales`.                                                                                                                                                 |
| **E2E**                       | _End to End_. Prueba que ejercita un flujo completo de usuario, de principio a fin.                                                                                                            |
| **EFECTIVO esperado**         | Efectivo que el sistema calcula que debería haber en caja: el monto de apertura más las ventas en efectivo del turno.                                                                          |
| **Fixture**                   | Datos de prueba preparados con anticipación.                                                                                                                                                   |
| **For Update (pesimista)**    | Instrucción SQL que bloquea una fila hasta terminar la transacción, evitando que dos operaciones concurrentes la modifiquen. Es el mecanismo detrás de RNF-03.                                 |
| **Frontend**                  | La interfaz que ve el usuario, construida con React.                                                                                                                                           |
| **Backend**                   | La API y la lógica de negocio, construidas con NestJS.                                                                                                                                         |
| **Guard**                     | Clase de NestJS que decide si una petición puede continuar. `JwtAuthGuard` y `RolesGuard`.                                                                                                     |
| **Hito**                      | Marca de significado en la hoja de ruta. StoreCore tiene 4 hitos, definidos en el [plan de desarrollo (08)](08-plan-desarrollo.md#2-hitos).                                                    |
| **HTTP status**               | Código de respuesta que indica el resultado: 200 éxito, 201 creado, 400 error de validación, 401 sin autenticación, 403 sin permiso, 404 no encontrado, 409 conflicto, 500 error del servidor. |
| **Intercepción**              | Proceso de envolver una respuesta o petición para transformarla (por ejemplo, serializar datos o medir duración).                                                                              |
| **JWT**                       | _JSON Web Token_. Token firmado que transporta la identidad del usuario. Ver RF-01.                                                                                                            |
| **Kanban**                    | Tablero visual con columnas de estado. En StoreCore: Pendiente, En curso, Hecho.                                                                                                               |
| **Lint**                      | Análisis estático del código para detectar errores de estilo y posibles errores lógicos.                                                                                                       |
| **LoggerMiddleware**          | Componente que registra cada petición HTTP con su duración.                                                                                                                                    |
| **Migración**                 | Archivo versionado que aplica cambios al esquema de la base de datos. Nunca se edita una migración ya aplicada.                                                                                |
| **Middleware**                | Función que se ejecuta antes de los controladores, como el registro de peticiones.                                                                                                             |
| **Modelo de datos**           | Definición de las entidades y sus relaciones. Ver el [esquema (10)](10-esquema-base-de-datos.md).                                                                                              |
| **Monorepo**                  | Repositorio único que contiene varios proyectos (aquí, `backend` y `frontend`).                                                                                                                |
| **ORM**                       | _Object-Relational Mapping_. Capa que mapea entre objetos y tablas. StoreCore usa TypeORM.                                                                                                     |
| **Paginación**                | División de resultados en páginas para no traer miles de registros a la vez.                                                                                                                   |
| **Punto de venta (POS)**      | Ver la sección de negocio.                                                                                                                                                                     |
| **Query builder**             | Constructor de consultas SQL de TypeORM, usado para reportes complejos y consultas agregadas.                                                                                                  |
| **RFC 2119**                  | Convención de Internet que define los niveles de requisito: DEBE, NO DEBE, DEBERÍA.                                                                                                            |
| **RF / RNF**                  | Requerimiento Funcional / No Funcional.                                                                                                                                                        |
| **Roles**                     | Permisos asociados a un usuario. StoreCore tiene `ADMIN` y `CASHIER`.                                                                                                                          |
| **Rollback**                  | Deshacer todos los cambios de una transacción que falló, dejando la base sin modificaciones.                                                                                                   |
| **Scope**                     | Alcance de un commit, entre paréntesis, que indica el módulo afectado.                                                                                                                         |
| **Seeder**                    | Script que carga datos iniciales. Idempotente: se puede ejecutar varias veces sin duplicar.                                                                                                    |
| **Servicio**                  | Capa que contiene la lógica de negocio y las transacciones.                                                                                                                                    |
| **Sprint**                    | Periodo de trabajo de dos semanas con un objetivo definido.                                                                                                                                    |
| **Sprint Goal**               | Objetivo único del sprint.                                                                                                                                                                     |
| **Stakeholder**               | Interesado en el proyecto. Ver la [definición (01)](01-definicion-de-la-solucion.md#5-stakeholders).                                                                                           |
| **Tabla dinámica**            | Consulta SQL que se construye por código según filtros y parámetros, en lugar de estar fija.                                                                                                   |
| **Trazabilidad**              | Capacidad de seguir un requerimiento desde su definición hasta su implementación y prueba. Ver la [matriz (09)](09-matriz-trazabilidad.md).                                                    |
| **Transacción**               | Conjunto de operaciones que se ejecutan juntas: si alguna falla, todas se deshacen.                                                                                                            |
| **UAT**                       | _User Acceptance Testing_. Validación con el usuario final. Ver la [checklist (15)](15-checklist-uat-s1.md).                                                                                   |
| **UAT**                       | También _User Acceptance Testing_. Ver arriba.                                                                                                                                                 |
| **Unitarias**                 | Pruebas de una unidad de código aislada, sin base de datos ni HTTP.                                                                                                                            |
| **Validador**                 | Clase que comprueba que los datos de entrada cumplen las reglas.                                                                                                                               |
| **Webhook**                   | Notificación que un sistema envía a otro cuando ocurre un evento. Fuera de alcance en el MVP.                                                                                                  |
| **Zod**                       | Librería de validación de esquemas usada en el frontend.                                                                                                                                       |
| **Zustand**                   | Librería de gestión de estado ligera, usada para la sesión y el carrito del POS.                                                                                                               |

---

## 3. Abreviaturas

| Abreviatura | Significado                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| ADMIN       | Administrador, con acceso total                                             |
| API         | Application Programming Interface                                           |
| CASHIER     | Cajero, con acceso limitado                                                 |
| CI          | Continuous Integration                                                      |
| CRUD        | Create, Read, Update, Delete                                                |
| DTO         | Data Transfer Object                                                        |
| E2E         | End to End                                                                  |
| HU          | Historia de Usuario                                                         |
| JWT         | JSON Web Token                                                              |
| MVP         | Minimum Viable Product, producto mínimo viable                              |
| ORM         | Object-Relational Mapping                                                   |
| POS         | Point of Sale, punto de venta                                               |
| PRD         | Product Requirements Document                                               |
| RF          | Requerimiento Funcional                                                     |
| RNF         | Requerimiento No Funcional                                                  |
| RN          | Regla de Negocio                                                            |
| RUTA        | Ruta HTTP                                                                   |
| SKU         | Stock Keeping Unit                                                          |
| SUT         | System Under Test                                                           |
| UAT         | User Acceptance Testing                                                     |
| UX          | User Experience, experiencia de usuario                                     |
| UUID        | Identificador único universal. StoreCore usa enteros secuenciales, no UUID. |

---

## 4. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                    |
| ------- | ----------- | ---------------- | ------------------------------ |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento |
