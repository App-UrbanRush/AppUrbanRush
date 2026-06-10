import 'dotenv/config';
import { DataSource } from 'typeorm';
import { MongoClient } from 'mongodb';

async function main() {
  const userIdArg = process.argv[2];
  if (!userIdArg) {
    console.error('Uso: npx ts-node scripts/seed-pending-liquidation.ts <USER_ID> [SUBTOTAL]');
    process.exit(1);
  }
  const userId = Number(userIdArg);
  const subtotal = Number(process.argv[3] ?? 50000);

  // 1) Buscar vendor_id en PostgreSQL por user_id
  const pg = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
  await pg.initialize();

  const rows = await pg.query(
    'SELECT vendor_id, business_name FROM vendors WHERE user_id = $1',
    [userId],
  );
  await pg.destroy();

  if (rows.length === 0) {
    console.error(`No se encontró un vendor para user_id=${userId}`);
    process.exit(1);
  }
  const vendorId = rows[0].vendor_id;
  console.log(`Vendor encontrado: vendor_id=${vendorId} (${rows[0].business_name})`);

  // 2) Insertar liquidación pendiente en MongoDB
  const commissionRate = Number(process.env.PLATFORM_COMMISSION ?? 0.15);
  const platformCommission = Math.round(subtotal * commissionRate);
  const vendorNet = subtotal - platformCommission;

  const mongoUri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/urbanrush';
  const mongo = new MongoClient(mongoUri);
  await mongo.connect();
  const db = mongo.db();

  const result = await db.collection('vendor_liquidations').insertOne({
    vendor_id: vendorId,
    order_id: 'test-order-' + Date.now(),
    subtotal,
    platform_commission: platformCommission,
    vendor_net: vendorNet,
    status: 'PENDING',
    paid_at: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await mongo.close();

  console.log('✓ Liquidación pendiente creada');
  console.log(`  _id: ${result.insertedId}`);
  console.log(`  vendor_id: ${vendorId}`);
  console.log(`  subtotal: $${subtotal}`);
  console.log(`  comisión 15%: $${platformCommission}`);
  console.log(`  vendor_net (a transferir): $${vendorNet}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
