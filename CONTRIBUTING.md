# Contribuir a StoreCore

Gracias por contribuir. Este documento define el flujo de trabajo del proyecto.

Toda la documentación técnica y de gestión vive en [`docs/`](docs/README.md).

---

## 1. Antes de empezar

### Requisitos

| Herramienta | Versión mínima | Verificar       |
| ----------- | -------------- | --------------- |
| Node.js     | 20.19 o 22.12+ | `node -v`       |
| pnpm        | 12.0           | `pnpm -v`       |
| Docker      | 24.0           | `docker -v`     |
| Git         | 2.40           | `git --version` |

> El proyecto usa **pnpm**, no npm ni yarn. Un solo `pnpm install` en la raíz instala
> ambos workspaces.

### Configuración

```bash
git clone https://github.com/danildperez04/storecore.git
cd storecore
pnpm install
cp .env.example .env
pnpm dev
```

## 2. Flujo de trabajo

```text
1. sync develop
   git switch develop && git pull origin develop

2. Crear la rama desde develop
   git switch -c feature/hu-14-stock-movements

3. Commits convencionales durante el trabajo
   git commit -m "feat(inventory): add stock movement entity"

4. Rebasear sobre develop antes de pedir revisión
   git fetch origin
   git rebase origin/develop
   git push --force-with-lease

5. Abrir el PR hacia develop
   gh pr create --base develop --head feature/hu-14-stock-movements

6. Tras el merge, eliminar la rama
   git switch develop && git pull
   git branch -d feature/hu-14-stock-movements
   git push origin --delete feature/hu-14-stock-movements
```

## 3. Reglas esenciales

1. **Nunca trabajes directo sobre `main` ni `develop`.** Todo cambio nace en una rama.
2. **Toda rama se crea desde `develop` actualizada**, no de una copia obsoleta.
3. **Los commits siguen [Conventional Commits](docs/06-convencion-de-commits.md)**,
   siempre en inglés. El hook de commitlint rechaza lo que no cumpla.
4. **El pie del commit referencia la historia y el requerimiento:**
   `Refs: HU-14 / RF-20 / RNF-03`.
5. **CI verde es obligatorio:** lint, typecheck, build y pruebas de ambos workspaces.
6. **El esquema solo cambia por migración.** `synchronize` es `false` siempre.
7. **El stock nunca es negativo** y **nunca se edita directo**: todo pasa por
   `stock_movement`, dentro de una transacción con `SELECT ... FOR UPDATE`.
8. **El controller no lleva lógica de negocio.** Esa lógica vive en el service.
9. **La documentación se actualiza en el mismo commit** que el cambio de comportamiento.
10. **Nada se borra si tiene historial.** Se desactiva con `is_active`.

Las reglas 7, 8 y 10 están desarrolladas en [`AGENTS.md`](AGENTS.md).

## 4. Antes de abrir un pull request

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm format
```

Y revisa esta lista:

- [ ] `pnpm lint` pasa sin errores
- [ ] `pnpm typecheck` pasa sin errores
- [ ] `pnpm test` pasa, incluidas las pruebas nuevas
- [ ] `pnpm format` aplicado
- [ ] La rama está rebaseada sobre `develop`
- [ ] El historial no mezcla cambios sin relación
- [ ] Los commits referencian `HU-nn` y `RF-nn`
- [ ] Si toca el esquema, hay migración con `up` y `down`
- [ ] Si toca la API, la documentación OpenAPI está actualizada
- [ ] `docs/09-matriz-trazabilidad.md` refleja el estado real
- [ ] `docs/10-esquema-base-de-datos.md` refleja cualquier cambio de esquema
- [ ] Sin secretos, sin `.env`, sin `console.log`
- [ ] El PR tiene al menos una aprobación antes de fusionarse

## 5. Estructura de un PR

**Título:** el mismo Conventional Commit que squasheará el merge.

```text
feat(inventory): add kardex view with pagination
```

**Descripción:**

```markdown
## Qué hace

Cierra RF-19. Muestra el historial de movimientos de un producto con paginación.

## Por qué

Sin el kardex, ningún descuadre de inventario es explicable.

## Cómo probarlo

1. Abrir un producto
2. Pestaña "Movimientos"
3. Verificar que aparecen entradas, salidas, ajustes y mermas

## Alcance

- Añade GET /api/v1/inventory/movements
- Añade MovementTypeFilter en la vista
- No toca el esquema

Refs: HU-25 / RF-19 / RNF-04
```

## 6. Definición de terminado

Una historia está terminada cuando:

- [ ] El código está en `develop`
- [ ] Lint, typecheck, build y pruebas en verde
- [ ] Hay pruebas nuevas que cubren el comportamiento
- [ ] La migración existe si cambió el esquema
- [ ] La documentación está actualizada
- [ ] El PR está aprobado

## 7. Reportar un defecto

Abre un issue con:

```markdown
## Qué pasa

El stock no baja cuando registro una venta.

## Pasos

1. Entrar al POS
2. Agregar 2 unidades de Sabritas
3. Cobrar
4. Ir a Inventario

## Qué esperaba

El stock baja de 50 a 48.

## Qué pasó

El stock sigue en 50.

## Ambiente

- Versión: 0.3.0
- Navegador: Chrome 141
- Sistema: Windows 11
```

Para defectos críticos, incluye el resultado esperado contra el obtenido y el
impacto en el negocio.

## 8. Revisión de código

Al revisar, prioriza en este orden:

1. **Corrección** — ¿La lógica es correcta? ¿Cumple las reglas de negocio?
2. **Integridad del stock** — ¿La operación es atómica? ¿Tiene `FOR UPDATE`?
3. **Pruebas** — ¿Cubre el caso crítico y los bordes?
4. **Seguridad** — ¿Valida entrada? ¿El rol es correcto?
5. **Mantenibilidad** — ¿El controller está delgado? ¿Los nombres son claros?
6. **Estilo** — ¿Lo resuelve Prettier? No lo comentes.

Un comentario debe indicar **qué** cambiar y **por qué**, no solo marcar una línea.

## 9. Ramas

| Prefijo    | Se fusiona en      | Uso                              |
| ---------- | ------------------ | -------------------------------- |
| `feature/` | `develop`          | Nueva funcionalidad              |
| `fix/`     | `develop`          | Corrección de bug                |
| `release/` | `main` y `develop` | Preparación de versión           |
| `hotfix/`  | `main` y `develop` | Corrección crítica en producción |

Formato: `<prefijo>/<hu-nn>-<descripcion-en-kebab-case>`

Detalle en [`docs/07-convencion-de-ramas.md`](docs/07-convencion-de-ramas.md).

## 10. Versionado

- SemVer: `MAJOR.MINOR.PATCH`
- El MVP vive en `0.x.y`; `1.0.0` tras el UAT
- Tags anotados, solo en `main`
- Al cerrar un release se sincroniza `version` en los tres `package.json`

Detalle en [`docs/05-estrategia-de-versionado.md`](docs/05-estrategia-de-versionado.md).

## 11. Referencias

| Documento                                                         | Contenido                               |
| ----------------------------------------------------------------- | --------------------------------------- |
| [`AGENTS.md`](AGENTS.md)                                          | Instrucciones para asistentes de código |
| [Definición de la solución](docs/01-definicion-de-la-solucion.md) | Alcance y objetivos                     |
| [PRD](docs/02-prd-mvp-moscow.md)                                  | Requerimientos y reglas de negocio      |
| [Backlog](docs/03-backlog-del-producto.md)                        | Historias de usuario                    |
| [Arquitectura](docs/14-arquitectura.md)                           | Capas y módulos                         |
| [Esquema de BD](docs/10-esquema-base-de-datos.md)                 | Entidades y migraciones                 |
| [Plan de pruebas](docs/12-plan-pruebas.md)                        | Estrategia de pruebas                   |
| [Guía de despliegue](docs/11-guia-despliegue.md)                  | Procedimiento de despliegue             |
| [Convención de commits](docs/06-convencion-de-commits.md)         | Formato de mensajes                     |
| [Convención de ramas](docs/07-convencion-de-ramas.md)             | Git Flow                                |
