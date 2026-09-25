# Plan Scrum — StoreCore

**Versión:** 1.0.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

---

## 1. Marco de trabajo

StoreCore desarrolla con **Scrum** bajo la definición de la [Scrum Guide 2020](https://scrumguides.org/scrum-guide.html).
Los artefactos y eventos se conservan; la duración del sprint y la ceremonia se
adaptan a un equipo de una persona.

| Parámetro               | Valor                                              |
| ----------------------- | -------------------------------------------------- |
| Duración del sprint     | 2 semanas (10 días hábiles)                        |
| Sprints totales         | 8 (Sprint 0 a Sprint 7)                            |
| Duración total estimada | 16 semanas (4 meses calendario)                    |
| Tamaño del equipo       | 1 desarrollador + Product Owner (dueño, parcial)   |
| Ceremonias              | Daily asincrónica, Planning, Review, Retrospectiva |

## 2. Roles

Con un solo desarrollador, los roles de Scrum se distribuyen así:

| Rol Scrum                | Quién lo ejerce                            | Responsabilidad                                                                |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------ |
| **Product Owner**        | Dueño de la pulquería                      | Define el orden del backlog, decide qué entra al sprint, valida el incremento. |
| **Scrum Master**         | El desarrollador (rotativo en la práctica) | Facilita ceremonias, remove impedimentos, vela por el proceso.                 |
| **Equipo de desarrollo** | El desarrollador                           | Construye el incremento, estima, escribe pruebas, revisa código.               |

> Con una persona, el rol de Scrum Master se autodesempeña. La separación real de
> responsabilidades se logra contra el **Product Owner externo**: el dueño prioriza
> y valida, el desarrollador implementa. Nunca el desarrollador decide qué es más
> importante para el negocio.

## 3. Artefactos

### 3.1 Product Backlog

Es el [Backlog del Producto (03)](03-backlog-del-producto.md). Contiene 56 historias
de usuario en 9 épicas, todas con criterios de aceptación y referencias a
requerimientos.

### 3.2 Sprint Backlog

Se crea en el Planning de cada sprint. Contiene:

- El **Sprint Goal**: el objetivo único del sprint.
- Las historias comprometidas, con su desglose técnico.
- La lista de tareas de implementación por historia.
- Los riesgos técnicos identificados del sprint.

El Sprint Backlog es visible y se actualiza a lo largo del sprint.

### 3.3 Incremento

Cada sprint produce un incremento **potencialmente publicable**: pasa `lint`,
`build`, `test` y puede desplegarse. El acumulable de los incrementos es el producto
que existe en `main`.

## 4. Eventos

### 4.1 Daily Meeting — 10 minutos, asincrónico

Con un desarrollador, la daily en vivo no aporta valor. Se reemplaza por una nota
diaria en el tablero con tres preguntas:

```
Fecha: 2026-10-06
Ayer: implementé la validación de stock con bloqueo pesimista
Hoy: cierro el endpoint de kardex y sus pruebas
Bloqueo: ninguno
```

Se publica antes de las 10:00. Si hay un bloqueo, se escala a conversación el mismo día.

### 4.2 Sprint Planning — 2 horas (día 1 del sprint)

**Objetivo:** acordar el Sprint Goal y el compromiso.

| Paso | Duración | Actividad                                                                 |
| ---- | -------- | ------------------------------------------------------------------------- |
| 1    | 15 min   | El Product Owner explica el contexto y el valor del sprint                |
| 2    | 45 min   | Revisión del backlog, se seleccionan historias hasta completar los puntos |
| 3    | 30 min   | Desglose técnico: qué tareas, qué archivos, qué migración                 |
| 4    | 20 min   | Definición de terminado específica del sprint                             |
| 5    | 10 min   | Identificación de riesgos y dependencias                                  |

**Regla de compromiso:** solo se compromete lo que cabe en la capacidad del sprint.
Si el Product Owner pide más, se negocia el alcance explícitamente o se mueve
historias al siguiente sprint. Nunca se compromete de más.

### 4.3 Sprint Review — 1 hora (día 10 del sprint)

Se demuestra el incremento funcionando, no un informe de tareas.

- Se ejecuta la funcionalidad frente al Product Owner.
- Se responde: ¿esto resuelve el problema real del negocio?
- El backlog se reordena según lo aprendido.
- Se registra en el documento de estado del proyecto qué quedó aceptado.

En los sprints 1, 3 y 6 el Product Owner prueba el sistema en su propia tienda.

### 4.4 Sprint Retrospective — 45 minutos (día 10 del sprint)

Se hace justo después del Review. Formato: se recoge, se discute, se actúa.

Se centra en **el proceso**, nunca en las personas.

| Pregunta       | Ejemplo de respuesta accionable                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| ¿Qué funcionó? | "La migración inicial con seeds salvó tiempo." → Replicar en cada sprint que toque esquema.                     |
| ¿Qué faltó?    | "No definí criterios de aceptación con el dueño." → Añadir sesión de refinamiento de 30 min antes del Planning. |
| ¿Qué molesto?  | "El contenedor de Postgres tardaba 40 s en arrancar en CI." → Levantar un service container en el job.          |
| ¿Qué probamos? | "Pedir la definición de terminado por escrito antes de arrancar."                                               |

Máximo tres acciones de mejora, cada una con responsable y fecha. Se revisan en la
retrospectiva siguiente.

## 5. Definition of Done

Se aplica a **toda** historia. No es negociable dentro de un sprint.

| #   | Criterio                                 | Verificable                          |
| --- | ---------------------------------------- | ------------------------------------ |
| 1   | Código combinado en `develop`            | Rama eliminada tras el merge         |
| 2   | `pnpm lint` sin errores                  | CI en verde                          |
| 3   | `pnpm build` sin errores de tipos        | CI en verde                          |
| 4   | Pruebas nuevas que pasan                 | CI en verde                          |
| 5   | Migración creada si cambia el esquema    | Archivo en `src/database/migrations` |
| 6   | Documentación actualizada                | `docs/10` y matriz de trazabilidad   |
| 7   | Sin `console.log` ni código muerto       | Revisión del PR                      |
| 8   | PR aprobado por otra persona             | Revisión de código                   |
| 9   | Commits convencionales con `Refs: HU-nn` | `commitlint` en verde                |

## 6. Definición de Hecho del Sprint

El sprint se cierra como **completo** cuando:

- [ ] Todas las historias comprometidas están en `TERMINADO`.
- [ ] El incremento pasa la checklist de release de
      [versionado (05)](05-estrategia-de-versionado.md#9-checklist-de-release).
- [ ] Se creó el tag de la versión del sprint.
- [ ] Se actualizó `00-estado-del-proyecto.md`.
- [ ] La matriz de trazabilidad refleja el estado real.

## 7. Roadmap de sprints

| Sprint       | Objetivo                                                                     | Versión | Historias     | Puntos |
| ------------ | ---------------------------------------------------------------------------- | ------- | ------------- | ------ |
| **Sprint 0** | Cimientos: monorepo, Docker, CI, auth, roles, sucursales, health             | `0.1.0` | HU-01 a HU-12 | 34     |
| **Sprint 1** | Catálogo maestro: categorías, proveedores, productos, stock inicial          | `0.2.0` | HU-13 a HU-19 | 24     |
| **Sprint 2** | Inventario: movimientos, ajustes, alertas, kardex                            | `0.3.0` | HU-20 a HU-26 | 31     |
| **Sprint 3** | Punto de venta: venta, pago, ticket, anulación, corte → **sistema vendible** | `0.4.0` | HU-27 a HU-34 | 34     |
| **Sprint 4** | Compras a proveedores: órdenes y recepción                                   | `0.5.0` | HU-35 a HU-40 | 19     |
| **Sprint 5** | Clientes y crédito: fiados, abonos, límites                                  | `0.6.0` | HU-41 a HU-46 | 21     |
| **Sprint 6** | Reportes y cortes completos, pulido de interfaz                              | `0.7.0` | HU-47 a HU-53 | 22     |
| **Sprint 7** | UAT con el dueño, estabilización, release estable                            | `1.0.0` | HU-54 a HU-56 | 13     |

El detalle de objetivos, entregables y criterios de aceptación de cada sprint está
en el [Plan de Desarrollo (08)](08-plan-desarrollo.md).

## 8. Plan de los sprints

### Sprint 0 — Cimientos (25 sep — 8 oct 2026)

- **Objetivo:** el sistema levanta completo con `docker compose up` y un usuario puede iniciar sesión.
- **Entregable:** esqueleto de producción con login funcionando.
- **Criterio de éxito:** `docker compose up --build` levanta los tres servicios, el login devuelve JWT y `/api/v1/health` responde con la base conectada.

### Sprint 1 — Catálogo (9 — 22 oct 2026)

- **Objetivo:** el dueño carga su inventario real en el sistema.
- **Entregable:** catálogo completo con búsqueda.
- **Criterio de éxito:** el dueño carga 50 productos reales y los encuentra por nombre y código de barras.

### Sprint 2 — Inventario (23 oct — 5 nov 2026)

- **Objetivo:** el stock se controla y avisa antes de agotarse.
- **Entregable:** movimientos, ajustes, merma, alertas y kardex.
- **Criterio de éxito:** un producto bajo mínimo aparece en la lista de alertas y su kardex explica cada cambio.

### Sprint 3 — Punto de venta (6 — 19 nov 2026)

- **Objetivo:** se puede vender y cerrar caja de punta a punta.
- **Entregable:** POS funcional con ticket, anulación y corte.
- **Criterio de éxito:** el cajero registra 20 ventas de prueba, el stock baja correctamente y el corte cuadra con el efectivo.

### Sprint 4 — Compras (20 nov — 3 dic 2026)

- **Objetivo:** el ciclo de compra al proveedor queda registrado y actualiza el stock.
- **Entregable:** órdenes de compra con recepción.
- **Criterio de éxito:** una orden recibida suma exactamente la cantidad recibida al stock de la sucursal.

### Sprint 5 — Crédito (4 — 17 dic 2026)

- **Objetivo:** el fiado deja de perderse.
- **Entregable:** clientes, crédito, abonos y estado de cuenta.
- **Criterio de éxito:** una venta a crédito suma al saldo, un abono lo reduce y el límite se respeta.

### Sprint 6 — Reportes (18 dic 2026 — 7 ene 2027)

- **Objetivo:** el dueño puede tomar decisiones con datos.
- **Entregable:** dashboard y seis reportes.
- **Criterio de éxito:** el dueño usa el dashboard para decidir su siguiente pedido a proveedor.

### Sprint 7 — UAT y release (8 — 21 ene 2027)

- **Objetivo:** validar en la tienda y liberar `1.0.0`.
- **Entregable:** sistema estable en producción.
- **Criterio de éxito:** checklist UAT completa, defectos altos cerrados, backup verificado y `v1.0.0` etiquetada.

> Sprint 6 y 7 cruzan el cambio de año. No se interrumpe el ritmo Scrum por las
> fiestas: si la capacidad baja, se reduce el compromiso, no se salta el sprint.

## 9. Métricas

| Métrica                  | Cómo se mide                                       | Meta                                         |
| ------------------------ | -------------------------------------------------- | -------------------------------------------- |
| **Velocity**             | Puntos comprometidos vs. terminados por sprint     | Establecer baseline en Sprint 0, luego ±15 % |
| **Compromiso cumplido**  | Historias `TERMINADO` / comprometidas              | ≥ 85 %                                       |
| **Defectos escapados**   | Defectos encontrados en UAT que entraron por un PR | ≤ 2 por sprint                               |
| **Cobertura de pruebas** | Líneas cubiertas en backend                        | ≥ 70 % (RNF-08)                              |
| **Tiempo de ciclo**      | Desde `EN CURSO` hasta `TERMINADO`                 | ≤ 5 días hábiles                             |
| **Salud del sprint**     | Acciones de retrospectiva cerradas                 | 100 % para el siguiente sprint               |
| **Uptime**               | Disponibilidad del servicio en producción          | ≥ 99 % mensual                               |

## 10. Riesgos ágiles

| #   | Riesgo                        | Señal temprana                         | Respuesta                                                                               |
| --- | ----------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | El alcance del MVP es amplio  | Sprint 3 sin margen para pruebas       | El Sprint 3 entrega un sistema vendible; se corta en S4–S6 si hace falta                |
| 2   | El dueño no responde a tiempo | Review aplazada más de una semana      | Definir una ventana de 2 días para responder; si no, se decide por criterio documentado |
| 3   | Dependencia de internet       | Reportes no disponibles en la tienda   | Operación local documentada; modo offline es post-MVP                                   |
| 4   | Burnout por trabajo solo      | Dos sprints seguidos con sobreesfuerzo | Reducir el compromiso; tomar medio día de descanso por sprint                           |
| 5   | Bugs de inventario            | Descuadre en el corte de caja          | Refuerzo de pruebas de concurrencia (HU-26) antes del Sprint 3                          |

## 11. Comunicación

| Stakeholder               | Frecuencia | Canal            | Contenido                                        |
| ------------------------- | ---------- | ---------------- | ------------------------------------------------ |
| Dueño (PO)                | Quincenal  | Sprint Review    | Incremento funcionando y decisiones de prioridad |
| Dueño (PO)                | Semanal    | Nota escrita     | Avance, bloqueo, decisión pendiente              |
| Equipo de desarrollo      | Diaria     | Nota asyncrónica | Ayer / hoy / bloqueo                             |
| Administrador de sistemas | Por evento | Ticket           | Despliegue, incidente, backup                    |

---

## 12. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                    |
| ------- | ----------- | ---------------- | ------------------------------ |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento |
