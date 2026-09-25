import 'reflect-metadata';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { hash } from 'bcrypt';
import { Logger } from '@nestjs/common';
import dataSource from '../data-source.js';
import { UserRole } from '#common/enums/domain.enums.js';
import { User } from '#modules/users/entities/user.entity.js';
import { Branch } from '#modules/branches/entities/branch.entity.js';

/**
 * Crea el usuario administrador.
 *
 * Uso: pnpm --filter backend user:create-admin
 *
 * Pide los datos por consola para no dejar credenciales en el historial del
 * shell ni en un archivo.
 */
async function main(): Promise<void> {
  const logger = new Logger('CreateAdmin');
  const rl = createInterface({ input: stdin, output: stdout });
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);

  try {
    const username = (await rl.question('Nombre de usuario: ')).trim();
    const email = (await rl.question('Correo electrónico: ')).trim();
    const fullName = (await rl.question('Nombre completo: ')).trim();
    const password = (await rl.question('Contraseña: ')).trim();

    if (!username || !email || !fullName || password.length < 8) {
      logger.error('Datos incompletos. La contraseña debe tener al menos 8 caracteres.');
      process.exitCode = 1;
      return;
    }

    await dataSource.initialize();

    const existing = await dataSource.getRepository(User).findOneBy({ username });
    if (existing) {
      logger.error(`Ya existe un usuario con el nombre "${username}".`);
      process.exitCode = 1;
      return;
    }

    const branches = await dataSource.getRepository(Branch).find({
      where: { isActive: true },
      order: { code: 'ASC' },
    });
    let branchId: number | null = null;
    if (branches.length === 1) {
      branchId = branches[0].id;
    } else if (branches.length > 1) {
      console.log('\nSucursales disponibles:');
      branches.forEach((branch, index) => {
        console.log(`  ${index + 1}) ${branch.code} — ${branch.name}`);
      });
      const choice = (await rl.question('Sucursal (número, vacío para todas): ')).trim();
      const index = Number(choice) - 1;
      branchId = Number.isInteger(index) && branches[index] ? branches[index].id : null;
    }

    const user = dataSource.getRepository(User).create({
      username,
      email,
      fullName,
      passwordHash: await hash(password, rounds),
      role: UserRole.ADMIN,
      branchId,
      isActive: true,
    });
    await dataSource.getRepository(User).save(user);

    logger.log(`Administrador "${username}" creado correctamente.`);
  } finally {
    rl.close();
    await dataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error('Error al crear el administrador:', error);
  process.exit(1);
});
