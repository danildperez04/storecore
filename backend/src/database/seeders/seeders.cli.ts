import { main } from './index.js';

main().catch((error: unknown) => {
  console.error('Error al cargar los datos iniciales:', error);
  process.exit(1);
});
