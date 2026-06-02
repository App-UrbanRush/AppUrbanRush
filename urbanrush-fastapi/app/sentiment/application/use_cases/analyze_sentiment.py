from datetime import datetime
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from app.sentiment.domain.entities.sentiment_result import SentimentResult
from app.sentiment.domain.repositories.sentiment_repository import ISentimentRepository

analyzer = SentimentIntensityAnalyzer()

class AnalyzeSentimentUseCase:
    def __init__(self, repository: ISentimentRepository):
        self.repository = repository

    def _classify(self, score: float, rating: int) -> str:
        text_sentiment = "POSITIVE" if score > 0.05 else "NEGATIVE" if score < -0.05 else "NEUTRAL"
        rating_sentiment = "POSITIVE" if rating >= 4 else "NEGATIVE" if rating <= 2 else "NEUTRAL"
        return text_sentiment if text_sentiment == rating_sentiment else rating_sentiment

    async def execute(self, data: dict) -> SentimentResult:
        scores = analyzer.polarity_scores(data["comment"])
        compound = scores["compound"]
        sentiment = self._classify(compound, data["rating"])

        await self.repository.save_review({
            "order_id": data["order_id"],
            "vendor_id": data["vendor_id"],
            "rating": data["rating"],
            "comment": data["comment"],
            "sentiment": sentiment,
            "score": compound,
            "created_at": datetime.utcnow()
        })

        return SentimentResult(
            sentiment=sentiment,
            score=round(compound, 4),
            saved=True
        )