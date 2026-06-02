from datetime import datetime
from app.sentiment.domain.entities.sentiment_result import SentimentReport
from app.sentiment.domain.repositories.sentiment_repository import ISentimentRepository

class GetVendorReportUseCase:
    def __init__(self, repository: ISentimentRepository):
        self.repository = repository

    async def execute(self, vendor_id: int) -> SentimentReport:
        reviews = await self.repository.get_reviews_by_vendor(vendor_id)

        if not reviews:
            return SentimentReport(
                avg_rating=0,
                total_reviews=0,
                sentiment_distribution={"POSITIVE": 0, "NEUTRAL": 0, "NEGATIVE": 0},
                recent_comments=[]
            )

        total = len(reviews)
        avg_rating = round(sum(r["rating"] for r in reviews) / total, 2)

        distribution = {"POSITIVE": 0, "NEUTRAL": 0, "NEGATIVE": 0}
        for r in reviews:
            distribution[r.get("sentiment", "NEUTRAL")] += 1

        recent = sorted(reviews, key=lambda r: r.get("created_at", datetime.min), reverse=True)[:5]
        recent_comments = [
            {
                "comment": r["comment"],
                "rating": r["rating"],
                "sentiment": r["sentiment"],
                "date": r.get("created_at", "").isoformat() if r.get("created_at") else ""
            }
            for r in recent
        ]

        return SentimentReport(
            avg_rating=avg_rating,
            total_reviews=total,
            sentiment_distribution=distribution,
            recent_comments=recent_comments
        )