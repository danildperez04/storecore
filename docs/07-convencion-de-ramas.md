# Convención de Ramas — StoreCore

**Versión:** 1.0.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

---

## 1. Modelo de ramificación

StoreCore usa un **Git Flow simplificado** con dos ramas permanentes y cuatro tipos
de rama temporal.

```
                         main
                          ^         (solo tags, version estable)
                          |
                    ┌─────┴─────┐
      merge --ff    │           │   release/vX.Y.Z
        ┌───────────┘           └───────────┐
        |                                   |
        |         develop  ←── merge de todas las features
        |            ^
        |            |  PR + code review
        |     feature/hu-12-stock-alerts
        |            |
        |            └── fix/hu-07-negative-stock (bug en develop)
        |
        └──── merge directo desde hotfix/vX.Y.Z (producción ↩ develop)
```

## 2. Ramas permanentes

| Rama      | Ciclo de vida | Propósito            | Reglas                                                                                               |
| --------- | ------------- | -------------------- | ---------------------------------------------------------------------------------------------------- |
| `main`    | Permanente    | Código en producción | Recibe merges de `release/*` y `hotfix/*` únicamente. Nunca se desarrolla directo. Solo se etiqueta. |
| `develop` | Permanente    | Rama de integración  | Recibe merges de `feature/*` y `fix/*`. Es la rama base de todo desarrollo.                          |

## 3. Ramas temporales

| Prefijo    | Se crea desde | Se fusiona en          | Uso                                 |
| ---------- | ------------- | ---------------------- | ----------------------------------- |
| `feature/` | `develop`     | `develop`              | Nueva funcionalidad ligada a una HU |
| `fix/`     | `develop`     | `develop`              | Corrección de bug en desarrollo     |
| `release/` | `develop`     | `main` y `develop`     | Preparación de una versión          |
| `hotfix/`  | `main`        | `main` **y** `develop` | Corrección crítica en producción    |

## 4. Formato de nombre

```
<prefijo>/<referencia>-<descripcion-en-kebab-case>
```

### 4.1 Reglas

1. Todo en **minúsculas**.
2. **Sin acentos**, sin eñes, sin caracteres especiales.
3. Separador `-` entre palabras; sin espacios.
4. Máximo 5 palabras en la descripción.
5. Se incluye la referencia de la historia de usuario cuando existe.
6. La descripción va **en inglés**, en coherencia con los commits.

### 4.2 Ejemplos

| Rama                            | Historia | Descripción                |
| ------------------------------- | -------- | -------------------------- |
| `feature/hu-01-jwt-login`       | HU-01    | Autenticación con JWT      |
| `feature/hu-09-product-crud`    | HU-09    | CRUD de productos          |
| `feature/hu-14-stock-movements` | HU-14    | Movimientos de inventario  |
| `feature/hu-21-pos-screen`      | HU-21    | Pantalla de punto de venta |
| `fix/hu-07-negative-stock`      | HU-07    | Stock negativo             |
| `fix/sales-zero-discount-total` | —        | Total con descuento cero   |
| `release/v0.4.0`                | —        | Release del Sprint 3       |
| `hotfix/v0.4.1-folio-duplicate` | —        | Folio duplicado            |

### 4.3 Nombres inválidos

```
Feature/Nueva-Logica          ✗ mayúscula y acento
feature/hu 1 login            ✗ espacio
feature/HU1-login             ✗ referencia mal formada
mi-rama                      ✗ sin prefijo ni referencia
feature/login                ✓ válido si no hay historia asignada
```

## 5. Ciclo de vida de una rama

```bash
# 1. Crear la rama desde develop, siempre actualizado
git switch develop
git pull origin develop
git switch -c feature/hu-14-stock-movements

# 2. Desarrollar con commits convencionales
git add .
git commit -m "feat(inventory): add stock movement entity"
git commit -m "feat(inventory): register entry and adjustment movements"

# 3. Subir la rama
git push -u origin feature/hu-14-stock-movements

# 4. Abrir PR hacia develop
gh pr create --base develop --head feature/hu-14-stock-movements

# 5. Rebasear sobre develop si llegó código nuevo, antes de pedir revisión
git fetch origin
git rebase origin/develop
git push --force-with-lease

# 6. Tras el merge, eliminar la rama
git switch develop
git pull origin develop
git branch -d feature/hu-14-stock-movements
git push origin --delete feature/hu-14-stock-movements
```

## 6. Reglas de trabajo

| #   | Regla                                                              |
| --- | ------------------------------------------------------------------ |
| 1   | Nadie trabaja directamente sobre `develop` ni `main`.              |
| 2   | Toda rama nace de `develop` actualizada, no de una copia obsoleta. |
| 3   | Antes de pedir revisión se hace `rebase` sobre `develop`.          |
| 4   | Todo PR requiere **al menos una aprobación** antes de fusionarse.  |
| 5   | Los PR cierran con `squash` y el mensaje del Conventional Commit.  |
| 6   | La rama se elimina en cuanto su PR se fusiona.                     |
| 7   | Un PR sin pruebas ni documentación afectada no se aprueba.         |
| 8   | `main` no recibe merges directos de `feature/*` ni `fix/*`.        |

### 6.1 Estrategia de merge

Se usa **squash merge** en `develop`, de modo que `develop` queda con commits
limpios y la trazabilidad por HU se lee en el historial. El squash conserva el
título y el pie del PR, que ya sigue la convención de commits.

## 7. Ramas protegidas

Configuración recomendada en GitHub para `main` y `develop`:

| Regla                                        | `develop`      | `main`                   |
| -------------------------------------------- | -------------- | ------------------------ |
| Requerir revisión antes de fusionar          | 1 aprobación   | 1 aprobación             |
| Requerir que lasconversation estén resueltas | Sí             | Sí                       |
| Prohibir force push                          | Sí             | Sí                       |
| Prohibir borrado                             | Sí             | Sí                       |
| Exigir CI en verde antes de fusionar         | Sí             | Sí                       |
| Permitirmerge squash                         | Sí             | Sí                       |
| Firmas en commits                            | No obligatorio | Recomendado en `hotfix/` |

## 8. Ramas `release/`

Se crean al cerrar el sprint, desde `develop`, cuando todas las historias están
terminadas.

```bash
git switch develop
git pull origin develop
git switch -c release/v0.4.0

# Solo se permiten correcciones de bug y de documentación en una release
git commit -m "fix(sales): correct total calculation with zero discount"

# Validar: lint, build, tests, migraciones y documentación
git push -u origin release/v0.4.0
gh pr create --base main --head release/v0.4.0

# Tras el merge a main, devolver los cambios a develop
git switch develop
git merge release/v0.4.0
git push origin develop
git branch -d release/v0.4.0
git push origin --delete release/v0.4.0
```

En una rama `release/` **no** se agregan funcionalidades nuevas: únicamente
correcciones de bug y ajustes de documentación o de versión.

## 9. Ramas `hotfix/`

Se crean desde `main` cuando hay un bug crítico en producción. Se fusionan en
`main` **y** en `develop` para que el arreglo no se pierda.

```bash
git switch main
git pull origin main
git switch -c hotfix/v0.4.1-folio-duplicate

git commit -m "fix(sales): prevent duplicate ticket folio on retry"

git push -u origin hotfix/v0.4.1-folio-duplicate

# Merge hacia main (y crear el tag del patch)
gh pr create --base main --head hotfix/v0.4.1-folio-duplicate

# Merge hacia develop, para no perder el arreglo
gh pr create --base develop --head hotfix/v0.4.1-folio-duplicate

git switch main
git tag -a v0.4.1 -m "v0.4.1 — hotfix: folio duplicado"
git push origin v0.4.1
```

---

## 10. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                    |
| ------- | ----------- | ---------------- | ------------------------------ |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento |
