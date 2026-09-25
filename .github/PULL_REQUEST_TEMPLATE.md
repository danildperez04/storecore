## Qué cambia

<!-- Describe el cambio en una o dos líneas. -->

## Por qué

<!-- Explica el problema que resuelve. Si es un bug, qué pasaba antes. -->

Closes #

## Trazabilidad

<!-- Obligatorio. Sin estos IDs el PR no se aprueba. -->

Refs: HU-nn / RF-nn / RNF-nn

## Alcance técnico

- [ ] Solo frontend
- [ ] Solo backend
- [ ] Cambia el esquema de datos (requiere migración)
- [ ] Cambia la API (requiere actualizar OpenAPI)
- [ ] Cambia la documentación

## Checklist de revisión

- [ ] `pnpm lint` pasa sin errores
- [ ] `pnpm typecheck` pasa sin errores
- [ ] `pnpm test` pasa, incluidas las pruebas nuevas
- [ ] `pnpm format` aplicado
- [ ] La rama está rebaseada sobre `develop`
- [ ] Los commits son convencionales y referencian `HU-nn` / `RF-nn`
- [ ] Si toca el esquema, la migración tiene `up` y `down`
- [ ] Las pruebas cubren el caso crítico y los bordes
- [ ] `docs/09-matriz-trazabilidad.md` refleja el estado real
- [ ] `docs/10-esquema-base-de-datos.md` refleja los cambios de esquema
- [ ] Sin secretos, sin `.env`, sin `console.log`

## Reglas de negocio verificadas

Si el cambio toca inventario, ventas, crédito o folios, confirma:

- [ ] El stock nunca queda negativo
- [ ] Toda variación de stock pasó por `stock_movement`
- [ ] La operación con stock está dentro de una transacción
- [ ] Se usó `SELECT ... FOR UPDATE` sobre `product_stock`
- [ ] El folio consecutivo se reservó con `FOR UPDATE`, no con `MAX() + 1`
- [ ] No se modificó ningún dato que tenga historial

## Cómo probarlo

<!-- Pasos numerados para que cualquiera pueda reproducirlo. -->

1.
2.
3.

## Capturas

<!-- Si es un cambio visual, adjunta antes y después. -->
