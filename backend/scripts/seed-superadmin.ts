import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const SUPERADMIN_EMAIL = process.argv[2] ?? 'superadmin@urbanrush.com';
const SUPERADMIN_PASSWORD = process.argv[3] ?? 'admin1234';

async function main() {
  const pg = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
  await pg.initialize();

  // 1) Asegurar que el rol SUPERADMIN (id=5) exista
  const roleCheck = await pg.query('SELECT rol_id FROM rol WHERE rol_id = 5');
  if (roleCheck.length === 0) {
    await pg.query(
      `INSERT INTO rol (rol_id, rol_name) VALUES (5, 'SUPERADMIN')
       ON CONFLICT (rol_id) DO NOTHING`,
    );
    console.log('✓ Rol SUPERADMIN creado');
  }

  // 2) Buscar si el user ya existe
  const existing = await pg.query(
    'SELECT user_id FROM users WHERE user_email = $1',
    [SUPERADMIN_EMAIL],
  );

  let userId: number;
  if (existing.length > 0) {
    userId = existing[0].user_id;
    console.log(`Usuario ya existía: user_id=${userId}`);
  } else {
    const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
    const userInsert = await pg.query(
      `INSERT INTO users (user_email, user_password, status)
       VALUES ($1, $2, true) RETURNING user_id`,
      [SUPERADMIN_EMAIL, passwordHash],
    );
    userId = userInsert[0].user_id;
    console.log(`✓ Usuario creado: user_id=${userId}`);
  }

  // Crear persona si no existe
  const personCheck = await pg.query(
    'SELECT people_id FROM people WHERE user_id = $1',
    [userId],
  );
  if (personCheck.length === 0) {
    await pg.query(
      `INSERT INTO people ("firstName", "firstLastName", cellphone, address, gender, user_id)
       VALUES ('Super', 'Admin', '0000000000', 'N/A', 'M', $1)`,
      [userId],
    );
    console.log('✓ Persona creada');
  } else {
    console.log('  (persona ya existía)');
  }

  // 3) Asignar rol SUPERADMIN si no lo tiene
  const roleAssigned = await pg.query(
    'SELECT * FROM userroles WHERE user_id = $1 AND rol_id = 5',
    [userId],
  );
  if (roleAssigned.length === 0) {
    await pg.query(
      'INSERT INTO userroles (user_id, rol_id) VALUES ($1, 5)',
      [userId],
    );
    console.log('✓ Rol SUPERADMIN asignado');
  } else {
    console.log('  (ya tenía rol SUPERADMIN)');
  }

  await pg.destroy();

  console.log('\n========================================');
  console.log('Credenciales del SUPERADMIN:');
  console.log(`  Email:    ${SUPERADMIN_EMAIL}`);
  console.log(`  Password: ${SUPERADMIN_PASSWORD}`);
  console.log('========================================\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
