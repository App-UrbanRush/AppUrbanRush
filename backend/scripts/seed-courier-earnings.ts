import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function main() {
  const courierIdArg = process.argv[2];
  if (!courierIdArg) {
    console.error('Uso: npx ts-node scripts/seed-courier-earnings.ts <COURIER_ID>');
    console.error('  Si no se pasa COURIER_ID, procesa todos los couriers con órdenes DELIVERED');
    process.exit(1);
  }
  const targetCourierId = courierIdArg ? Number(courierIdArg) : null;

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/urbanrush';
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db();

  const ordersCollection = db.collection('orders');
  const earningsCollection = db.collection('courier_earnings');

  const query: any = { status: 'DELIVERED', courier_id: { $ne: null } };
  if (targetCourierId) {
    query.courier_id = targetCourierId;
  }

  const deliveredOrders = await ordersCollection.find(query).toArray();
  console.log(`Órdenes DELIVERED encontradas: ${deliveredOrders.length}`);

  let created = 0;
  let skipped = 0;

  for (const order of deliveredOrders) {
    const existing = await earningsCollection.findOne({ order_id: order._id.toString() });
    if (existing) {
      skipped++;
      continue;
    }

    await earningsCollection.insertOne({
      courier_id: order.courier_id,
      order_id: order._id.toString(),
      delivery_fee: order.delivery_fee || 3000,
      status: 'PENDING',
      created_at: new Date(),
      paid_at: null,
    });
    created++;
  }

  console.log(`Creadas: ${created} | Saltadas (ya existían): ${skipped}`);

  if (created > 0) {
    const courierIds = [...new Set(deliveredOrders.map((o) => o.courier_id))];
    console.log(`Couriers afectados: ${courierIds.join(', ')}`);
  }

  await client.close();
  console.log('✅ Migración completada');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
