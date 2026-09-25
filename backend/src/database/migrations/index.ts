import { InitialSchema1789270000000 } from './1789270000000-InitialSchema.js';

/**
 * Migraciones de StoreCore, en orden de aplicación.
 *
 * Reglas (docs/10-esquema-base-de-datos.md §7):
 * 1. Se nombran <timestamp>-<PascalCase>.ts.
 * 2. Cada una implementa up y down.
 * 3. Una migración ya aplicada en main NO se edita: se agrega otra que corrige.
 * 4. Los datos iniciales van en seeders, no en migraciones.
 */
export const migrations = [InitialSchema1789270000000];

export { InitialSchema1789270000000 };
