from app.delivery_time.domain.repositories.delivery_repository import IDeliveryRepository
from app.database import get_db

class MongoDeliveryRepository(IDeliveryRepository):
    async def count_active_orders(self, vendor_id: int) -> int:
        db = get_db()
        return await db["orders"].count_documents({
            "vendor_id": vendor_id,
            "status": {"$in": ["ACCEPTED", "PREPARING"]}
        })