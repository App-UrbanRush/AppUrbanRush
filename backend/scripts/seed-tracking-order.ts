import 'dotenv/config';
import { DataSource } from 'typeorm';
import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcrypt';

const COURIER_EMAIL = 'courier1@test.com';
const CLIENT_EMAIL = 'cliente1@test.com';
const PASSWORD = 'test1234';
const VENDOR_ID = Number(process.argv[2] ?? 2); // vendor existente

async function ensureRole(pg: DataSource, rolId: number, name: string) {
  const r = await pg.query('SELECT rol_id FROM rol WHERE rol_id = $1', [rolId]);
  if (r.length === 0) {
    await pg.query('INSERT INTO rol (rol_id, rol_name) VALUES ($1, $2)', [rolId, name]);
  }
}

async function ensureUser(pg: DataSource, email: string, rolId: number): Promise<number> {
  const existing = await pg.query('SELECT user_id FROM users WHERE user_email = $1', [email]);
  let userId: number;
  if (existing.length > 0) {
    userId = existing[0].user_id;
  } else {
    const hash = await bcrypt.hash(PASSWORD, 10);
    const ins = await pg.query(
      'INSERT INTO users (user_email, user_password, status) VALUES ($1, $2, true) RETURNING user_id',
      [email, hash],
    );
    userId = ins[0].user_id;
  }
  // persona
  const p = await pg.query('SELECT people_id FROM people WHERE user_id = $1', [userId]);
  if (p.length === 0) {
    await pg.query(
      `INSERT INTO people ("firstName", "firstLastName", cellphone, address, gender, user_id)
       VALUES ('Test', 'User', '3000000000', 'Calle 1', 'M', $1)`,
      [userId],
    );
  }
  // rol
  const ur = await pg.query('SELECT * FROM userroles WHERE user_id = $1 AND rol_id = $2', [userId, rolId]);
  if (ur.length === 0) {
    await pg.query('INSERT INTO userroles (user_id, rol_id) VALUES ($1, $2)', [userId, rolId]);
  }
  return userId;
}

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

  await ensureRole(pg, 2, 'USER');
  await ensureRole(pg, 3, 'DOMICILIARIO');

  // 1) Cliente (USER)
  const clientUserId = await ensureUser(pg, CLIENT_EMAIL, 2);

  // 2) Domiciliario (DOMICILIARIO) + fila en couriers
  const courierUserId = await ensureUser(pg, COURIER_EMAIL, 3);
  let courierRow = await pg.query('SELECT couriers_id FROM couriers WHERE user_id = $1', [courierUserId]);
  let couriersId: number;
  if (courierRow.length === 0) {
    const ins = await pg.query(
      `INSERT INTO couriers (vehicle_type, vehicle_plate, soat_number, status, user_id)
       VALUES ('Moto', 'TST-001', 'SOAT-001', 'ACTIVE', $1) RETURNING couriers_id`,
      [courierUserId],
    );
    couriersId = ins[0].couriers_id;
  } else {
    couriersId = courierRow[0].couriers_id;
  }

  await pg.destroy();

  // 3) Pedido IN_DELIVERY en MongoDB
  const mongoUri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/urbanrush';
  const mongo = new MongoClient(mongoUri);
  await mongo.connect();
  const db = mongo.db();

  const result = await db.collection('orders').insertOne({
    user_id: clientUserId,
    vendor_id: VENDOR_ID,
    courier_id: couriersId,
    status: 'IN_DELIVERY',
    delivery_address: 'Calle 100 # 15-20, Bogotá',
    subtotal: 50000,
    delivery_fee: 3000,
    platform_commission: 7500,
    total: 60500,
    items: [{ product_id: 'p1', product_name: 'Combo', quantity: 1, unit_price: 50000 }],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await mongo.close();

  console.log('\n========================================');
  console.log('✓ Escenario de tracking listo');
  console.log('----------------------------------------');
  console.log(`Order ID (IN_DELIVERY):  ${result.insertedId}`);
  console.log(`courier_id asignado:     ${couriersId}`);
  console.log('');
  console.log('CREDENCIALES:');
  console.log(`  Domiciliario → ${COURIER_EMAIL} / ${PASSWORD}`);
  console.log(`  Cliente      → ${CLIENT_EMAIL} / ${PASSWORD}`);
  console.log('========================================\n');
  console.log('Pega ese Order ID en el cliente HTML y haz login con cada usuario para sacar sus tokens.');
}

main().catch((e) => { console.error(e); process.exit(1); });
