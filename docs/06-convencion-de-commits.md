# Convención de Commits — StoreCore

**Versión:** 1.0.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

---

## 1. Estándar

StoreCore usa **Conventional Commits 1.0.0**. El formato es:

```
<tipo>(<alcance>): <descripción breve>

[cuerpo opcional]

[pie opcional: referencias a historias y tickets]
```

## 2. Reglas obligatorias

1. La descripción va **en inglés**, en minúsculas, en imperativo, **sin punto final** y con máximo 72 caracteres.
2. Los tipos, alcances y descripciones siempre en **inglés**, aunque la interfaz y la documentación estén en español.
3. **Un commit = un cambio lógico.** Nunca se mezclan un `feat` y un `fix` sin relación.
4. Todo requerimiento se referencia en el pie cuando aplique: `Refs: HU-14 / RF-20`.
5. Se prohíben los mensajes genéricos: `cambios`, `update`, `fix bugs`, `wip`, `pendientes`.
6. Los commits de reversión usan el tipo `revert` y referencian el commit original.
7. Un PR con historial que viola la convención no pasa la revisión.

## 3. Tipos permitidos

Solo estos once. Cualquier otro tipo es un error y `commitlint` lo rechazará.

| Tipo       | Uso                                                   | Impacto en release |
| ---------- | ----------------------------------------------------- | ------------------ |
| `feat`     | Funcionalidad nueva                                   | MINOR              |
| `fix`      | Corrección de bug                                     | PATCH              |
| `docs`     | Solo documentación                                    | Ninguno            |
| `style`    | Formato, espacios, punto y coma. Sin cambio de lógica | Ninguno            |
| `refactor` | Reestructuración sin agregar ni cambiar funcionalidad | PATCH              |
| `perf`     | Mejora de rendimiento                                 | PATCH              |
| `test`     | Agregado o corrección de pruebas                      | Ninguno            |
| `build`    | Sistema de build, dependencias, `package.json`        | Ninguno            |
| `ci`       | Workflows de GitHub Actions, configuración de CI      | Ninguno            |
| `chore`    | Tareas de mantenimiento que no tocan código           | Ninguno            |
| `revert`   | Revierte un commit anterior                           | PATCH              |

> No existe `styles` (con `s`). Ese error se cuela seguido; `commitlint` lo rechaza.

## 4. Alcances del dominio

El alcance indica **el módulo afectado**, no la capa técnica.

| Alcance      | Módulo                                      | Requerimientos relacionados |
| ------------ | ------------------------------------------- | --------------------------- |
| `auth`       | Autenticación, JWT, guards                  | RF-01, RF-02, RF-05         |
| `users`      | Gestión de usuarios                         | RF-03, RF-06                |
| `branches`   | Sucursales                                  | RF-04                       |
| `categories` | Categorías de producto                      | RF-07                       |
| `suppliers`  | Proveedores                                 | RF-08                       |
| `products`   | Productos y catálogo                        | RF-09 a RF-13               |
| `inventory`  | Movimientos, ajustes, alertas, kardex       | RF-14 a RF-20               |
| `pos`        | Pantalla y flujo de venta                   | RF-21 a RF-23               |
| `sales`      | Ventas, anulación, tickets, folios          | RF-24 a RF-28               |
| `cash`       | Apertura y cierre de caja, arqueo           | RF-29                       |
| `purchases`  | Órdenes de compra y recepción               | RF-30 a RF-35               |
| `customers`  | Clientes, crédito, abonos                   | RF-36 a RF-42               |
| `reports`    | Reportes y dashboard                        | RF-43 a RF-50               |
| `db`         | Migraciones, seeders, esquema               | RNF-03, RNF-04              |
| `api`        | Contrato HTTP, DTOs, validación transversal | RNF-06                      |
| `ui`         | Design system, componentes compartidos      | RNF-12, RNF-15              |
| `deps`       | Actualización de dependencias               | —                           |
| `docker`     | Dockerfiles, compose, Nginx                 | RNF-09, RNF-10              |
| `docs`       | Documentación                               | —                           |
| `cicd`       | GitHub Actions, Dependabot                  | RNF-08                      |
| `test`       | Infraestructura de pruebas                  | RNF-08                      |

### 4.1 Alcance para cambios transversales

Cuando un commit afecta a varios módulos, se elige el módulo **principal** de la
funcionalidad. Si el commit realmente no pertenece a un solo módulo, se usa `api`,
`db` o `ui`:

```
refactor(ui): extract shared MoneyInput component
perf(api): add composite index on stock_movement lookup
chore(deps): bump nestjs to v12
```

No se usan alcances por workspace (`client`, `server`): eso describe **dónde**
está el archivo, no **qué** cambió, y no escala.

## 5. Alcance múltiple

Cuando el cambio afecta legítimamente a dos módulos del mismo dominio, se separan
en dos commits. Si es inseparable, se documenta en el cuerpo.

```
feat(inventory): add waste movement type        <- commit 1
feat(reports): include waste in rotation       <- commit 2
```

## 6. Formato detallado

```
fix(inventory): prevent stock from going negative

Clamp the requested quantity against the available stock inside the
same transaction that creates the movement, using a pessimistic write
lock on the product_stock row.

Two concurrent sales could both read the same quantity and both
succeed, driving stock below zero. The lock serialises them.

Refs: HU-14 / RF-20 / RNF-03
```

- **Asunto:** imperativo, minúsculas, sin punto. Ej.: `add`, `fix`, `update`, `remove`.
- **Cuerpo:** explica **por qué**, no **qué**. Envuelve a 72 caracteres. Separa párrafos con línea en blanco.
- **Pie:** referencias a issues. Se usa `Refs:` para referencias simples y `Closes:` cuando el commit cierra el ticket.

## 7. Tipos de pie

| Prefijo                          | Uso                                              |
| -------------------------------- | ------------------------------------------------ |
| `Refs: HU-14 / RF-20`            | Referencia a historia o requerimiento            |
| `Closes: #42`                    | Cierra el issue 42 al hacer merge                |
| `Fixes: #42`                     | Igual que `Closes`                               |
| `BREAKING CHANGE: <descripción>` | Obligatorio cuando hay ruptura de compatibilidad |

## 8. Cambios incompatibles

Se marcan con `!` después del tipo o del alcance, y exigen la nota `BREAKING CHANGE`
en el cuerpo:

```
feat(sales)!: rename sale.total to sale.grand_total

The field was ambiguous with the subtotal field. It is now
grand_total and the API returns both.

BREAKING CHANGE: the `total` field of the sale response was renamed to
`grand_total`. The frontend must be updated in the same PR.

Refs: HU-29
```

Este commit obliga a un release `MAJOR` (o, en el rango `0.x`, a documentar
explícitamente la ruptura en las notas del release).

## 9. Ejemplos reales del proyecto

```
feat(auth): add jwt login with role-based guards
feat(branches): add branch crud with admin-only access
feat(products): add barcode lookup on catalog table
feat(inventory): register stock movements with type and reason
feat(inventory): trigger low stock alert below minimum threshold
feat(pos): add product search grid with barcode scanning
feat(sales): make sale creation atomic with stock deduction
feat(purchases): receive order items and increment stock
feat(reports): add sales report grouped by day
fix(inventory): block sale when stock is insufficient
fix(sales): correct grand total when discount is zero
fix(sales): prevent duplicate ticket folio on retry
fix(cash): compute expected amount from payment methods
refactor(sales): extract MoneyService for rounding rules
refactor(ui): extract reusable StatCard component
perf(reports): add composite index on sale created_at
test(inventory): cover concurrent sale stock race condition
test(sales): cover anulation returning stock to inventory
chore(db): initial migration with all fourteen entities
chore(db): seed fifty real abarrotes products
ci: run client tests in the pipeline
docs(scrum): update backlog with actual sprint 2 points
build(deps): bump nestjs to v12
```

## 10. Enforcement

La convención no es una recomendación: se valida automáticamente.

| Pieza                             | Propósito                                                     |
| --------------------------------- | ------------------------------------------------------------- |
| `commitlint.config.mjs`           | Define los tipos y alcances permitidos                        |
| Husky → `commit-msg`              | Bloquea commits con formato inválido                          |
| Husky → `pre-commit`              | `lint-staged` ejecuta ESLint + Prettier sobre archivos staged |
| `@commitlint/config-conventional` | Reglas base de Conventional Commits                           |

```bash
# Verificar un commit concreto
npx commitlint --from HEAD~1 --to HEAD

# Validar un mensaje antes de escribirlo
echo "feat(inventory): add kardex view" | npx commitlint
```

Si el hook rechaza el commit, el mensaje **no se reescribe**: se corrige y se
reintenta con `git commit`. Para casos excepcionales se usa
`git commit --no-verify` y se documenta en el PR el motivo.

## 11. Errores frecuentes

| Error                          | Corrección                                |
| ------------------------------ | ----------------------------------------- |
| `styles(...)`                  | `style(...)`                              |
| `Actualizar cosa`              | `feat(module): update thing`              |
| `cambios varios`               | Dividir en varios commits lógicos         |
| `feat: agregar login`          | `feat(auth): add login`                   |
| `feat(auth): Agrega login.`    | Minúsculas, sin punto final               |
| `fix(frontend): ...`           | `fix(ui): ...`                            |
| Asunto de más de 72 caracteres | Se permite el salto con `\n` en el cuerpo |

---

## 12. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                    |
| ------- | ----------- | ---------------- | ------------------------------ |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento |
