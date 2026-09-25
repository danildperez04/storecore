# Estrategia de Versionado — StoreCore

**Versión:** 1.0.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

---

## 1. Estándar

StoreCore usa **Semantic Versioning 2.0.0**: `MAJOR.MINOR.PATCH`.

```
7 . 0 . 4
│   │   └── PATCH: corrección de errores
│   └────── MINOR: funcionalidad nueva compatible hacia atrás
└────────── MAJOR: cambio incompatible con la API o el modelo de datos
```

## 2. Política de versiones durante el desarrollo

Mientras el sistema no está en producción y la API puede cambiar, la versión vive
en el rango `0.x.y`.

| Versión           | Significado                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| `0.0.x`           | Prototipo descartable, sin garantía de nada                                  |
| `0.1.0`           | Primer esqueleto funcional (Sprint 0 — Cimientos)                            |
| `0.2.0` … `0.7.0` | Incrementos de funcionalidad, uno por sprint                                 |
| `0.9.x`           | -feature complete, en preparación para release                               |
| `1.0.0`           | **Primera versión estable en producción.** API y esquema de datos congelados |

A partir de `1.0.0` se respetan las garantías de SemVer: nada en `PATCH` rompe la
API, nada en `MINOR` rompe compatibilidad, y todo cambio incompatible exige `MAJOR`.

## 3. Calendario de releases

Cada sprint de dos semanas cierra con un release versionado. La versión se asigna
al abrir el sprint, no al cerrarlo, para que la documentación y los tickets ya la
refieran desde el día uno.

| Sprint   | Versión | Contenido                                                   |
| -------- | ------- | ----------------------------------------------------------- |
| Sprint 0 | `0.1.0` | Cimientos: monorepo, infra, auth, roles, sucursales, health |
| Sprint 1 | `0.2.0` | Catálogo: categorías, proveedores, productos                |
| Sprint 2 | `0.3.0` | Inventario: movimientos, ajustes, alertas                   |
| Sprint 3 | `0.4.0` | Punto de venta y corte de caja básico                       |
| Sprint 4 | `0.5.0` | Compras a proveedores                                       |
| Sprint 5 | `0.6.0` | Clientes y crédito                                          |
| Sprint 6 | `0.7.0` | Reportes y cortes completos. **Fin del MVP**                |
| Sprint 7 | `1.0.0` | UAT, estabilización, primer release estable                 |

## 4. Reglas de incremento

| Cambio                                         | Incremento                          | Ejemplo                                      |
| ---------------------------------------------- | ----------------------------------- | -------------------------------------------- |
| Nueva funcionalidad                            | MINOR                               | Módulo de compras a proveedores              |
| Corrección de bug                              | PATCH                               | El total con descuento cero se calculaba mal |
| Reestructuración interna sin cambio observable | PATCH                               | Extraer `MoneyService` a un módulo propio    |
| Cambio en la forma de un endpoint existente    | MAJOR                               | Renombrar `sale.total` a `sale.grandTotal`   |
| Eliminación de un endpoint o columna           | MAJOR                               | Quitar `GET /api/products/:id/stock`         |
| Cambio en el esquema que obliga a migrar datos | MAJOR si rompe, MINOR si es aditiva | Agregar columna con valor por defecto        |

### 4.1 Cambios que NO incrementan la versión

- Documentación (`docs/`, `README`, comentarios JSDoc).
- Refactors sin cambio observable.
- Cambios de estilo o formato.
- Mejoras internas de rendimiento sin cambio de contrato.

## 5. Versionado de la base de datos

El esquema **no** usa SemVer. Las migraciones se identifican con marca de tiempo y
nombre descriptivo, y se aplican de forma secuencial e irreversible.

```
1789270000000-InitialSchema.ts
1789350000000-AddProductStock.ts
...
```

- `synchronize` está **desactivado** en todos los entornos. El esquema se cambia
  únicamente por migración.
- Las migraciones nunca se editan una vez aplicadas en `main`; se agrega una nueva
  que corrige.
- Cada migración es reversible (`down`) salvo que se documente explícitamente lo contrario.
- Los nombres de tabla y columna usan `snake_case` en inglés y en singular
  (ver [Esquema de BD (10)](10-esquema-base-de-datos.md)).

## 6. Versionado de la API

La API expone el número de versión en la URL desde `1.0.0`:

```
/api/v1/health
/api/v1/auth/login
/api/v1/products
```

- `/api/v1/*` es la superficie estable.
- Cuando aparezca una segunda versión incompatible, convivirían `/api/v1/*` y `/api/v2/*`
  durante al menos un ciclo de release.
- El frontend se fija a una sola versión: `VITE_API_URL=/api/v1`.

## 7. Tags de Git

Solo se etiqueta en `main`, y siempre con tag anotado.

```bash
git switch main
git pull --ff-only origin main
git tag -a v0.4.0 -m "Sprint 3: punto de venta y corte de caja"
git push origin v0.4.0
```

### 7.1 Formato del mensaje de tag

```
v<MAJOR>.<MINOR>.<PATCH> — Sprint <N>: <descripción breve>
```

| Ejemplo                                              | Contexto       |
| ---------------------------------------------------- | -------------- |
| `v0.1.0 — Sprint 0: cimientos, auth y roles`         | Primer release |
| `v0.4.0 — Sprint 3: punto de venta y corte de caja`  | Funcionalidad  |
| `v0.4.1 — Sprint 3: corrección de folios duplicados` | Corrección     |
| `v1.0.0 — Sprint 7: release estable tras UAT`        | Primer estable |

### 7.2 Prerelease

Mientras el sistema esté en `0.x` se permiteSuffix de prelanzamiento para
entregas que aún no se consideran terminadas:

```
v0.6.0-alpha.1     primera entrega de crédito, incompleta
v0.6.0-rc.1         candidato a release, en pruebas finales
```

## 8. Sincronización del campo `version`

Al cerrar un release se actualiza el campo `version` en los **tres** `package.json`
(raíz, `backend` y `frontend`) para que coincidan con el tag:

```bash
npm version 0.4.0 --workspaces --include-workspace-root --no-git-tag-version
```

Si el campo queda desincronizado respecto al tag, la versión publicada no coincide
con lo que dice el código. Es un paso obligatorio de la checklist de release.

## 9. Checklist de release

Antes de etiquetar una versión:

- [ ] Todos los requerimientos `Must` del sprint están implementados.
- [ ] `lint`, `typecheck`, `build` y `test` en verde en CI.
- [ ] Las migraciones del sprint están aplicadas y probadas.
- [ ] La documentación está actualizada (`docs/` y `README.md`).
- [ ] El campo `version` de los tres `package.json` coincide con la del tag.
- [ ] Se actualizó el estado del proyecto (`00-estado-del-proyecto.md`).
- [ ] Se labelaron los issues cerrados con el tag del release.
- [ ] El changelog del sprint está en la wiki o en las notas del release de GitHub.

---

## 10. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                    |
| ------- | ----------- | ---------------- | ------------------------------ |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento |
