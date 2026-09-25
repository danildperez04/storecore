import { defineConfig, mergeConfig } from 'vitest/config';
import base from './vitest.config.ts';

/**
 * Configuracion de las pruebas de integracion (Supertest contra la API real y
 * un PostgreSQL de pruebas). Se separan de las unitarias porque requieren la
 * base de datos levantada y son mas lentas.
 */
export default mergeConfig(
  base,
  defineConfig({
    test: {
      include: ['test/**/*.e2e-spec.ts'],
      setupFiles: ['./test/setup-env.ts'],
      // Las pruebas de concurrencia necesitan margen: la transaccion de
      // postgres y el bloqueo pesimista tardan mas que una operacion simple.
      testTimeout: 30_000,
      hookTimeout: 30_000,
      // Secuencial: comparten una sola base de datos y datos unicos por
      // ejecucion evitan colisiones, pero en paralelo el pool se agota.
      fileParallelism: false,
    },
  }),
);
