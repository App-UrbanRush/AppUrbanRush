import 'dotenv/config';
import { DataSource } from 'typeorm';
import { MongoClient } from 'mongodb';

// Crea un pedido en estado READY (sin domiciliario) para probar "Pedidos disponibles".
const CLIENT_EMAIL = 'cliente1@test.com';
const VENDOR_ID = Number(process.argv[2] ?? 2);

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
  const rows = await pg.query('SELECT user_id FROM users WHERE user_email = $1', [CLIENT_EMAIL]);
  await pg.destroy();
  if (rows.length === 0) {
    console.error(`No existe el cliente ${CLIENT_EMAIL}. Corre primero seed-tracking-order.ts`);
    process.exit(1);
  }
  const clientUserId = rows[0].user_id;

  const mongo = new MongoClient(process.env.MONGO_URI ?? 'mongodb://localhost:27017/urbanrush');
  await mongo.connect();
  const result = await mongo.db().collection('orders').insertOne({
    user_id: clientUserId,
    vendor_id: VENDOR_ID,
    courier_id: null,
    status: 'READY',
    delivery_address: 'Carrera 7 # 45-10, Bogotá',
    subtotal: 30000,
    delivery_fee: 3000,
    platform_commission: 4500,
    total: 37500,
    items: [{ product_id: 'p2', product_name: 'Pizza', quantity: 1, unit_price: 30000 }],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await mongo.close();

  console.log('\n✓ Pedido READY creado (aparecerá en "Disponibles")');
  console.log(`  Order ID: ${result.insertedId}`);
  console.log(`  vendor_id: ${VENDOR_ID} | tarifa domicilio: $3000`);
}

main().catch((e) => { console.error(e); process.exit(1); });
