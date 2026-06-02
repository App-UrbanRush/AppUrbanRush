from typing import List
from app.sentiment.domain.repositories.sentiment_repository import ISentimentRepository
from app.database import get_db

class MongoSentimentRepository(ISentimentRepository):
    async def save_review(self, review: dict) -> None:
        db = get_db()
        await db["reviews"].insert_one(review)

    async def get_reviews_by_vendor(self, vendor_id: int) -> List[dict]:
        db = get_db()
        return await db["reviews"].find({"vendor_id": vendor_id}).to_list(length=None)