from datetime import datetime, timedelta
from typing import List
from app.analytics.domain.repositories.analytics_repository import IAnalyticsRepository
from app.database import get_db

class MongoAnalyticsRepository(IAnalyticsRepository):
    async def get_orders_by_vendor(self, vendor_id: int) -> List[dict]:
        db = get_db()
        return await db["orders"].find({"vendor_id": vendor_id}).to_list(length=None)

    async def get_orders_by_vendor_since(self, vendor_id: int, days: int) -> List[dict]:
        db = get_db()
        since = datetime.utcnow() - timedelta(days=days)
        return await db["orders"].find({
            "vendor_id": vendor_id,
            "createdAt": {"$gte": since}
        }).to_list(length=None)