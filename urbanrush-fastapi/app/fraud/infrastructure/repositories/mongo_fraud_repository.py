from datetime import datetime, timedelta
from typing import List
from app.fraud.domain.repositories.fraud_repository import IFraudRepository
from app.database import get_db

class MongoFraudRepository(IFraudRepository):
    async def count_recent_orders(self, user_id: int, minutes: int) -> int:
        db = get_db()
        since = datetime.utcnow() - timedelta(minutes=minutes)
        return await db["orders"].count_documents({
            "user_id": user_id,
            "createdAt": {"$gte": since}
        })

    async def count_total_payments(self, user_id: int) -> int:
        db = get_db()
        return await db["payments"].count_documents({"user_id": user_id})

    async def get_previous_addresses(self, user_id: int) -> List[str]:
        db = get_db()
        return await db["orders"].distinct("delivery_address", {"user_id": user_id})