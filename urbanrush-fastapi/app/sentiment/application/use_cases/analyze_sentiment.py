from datetime import datetime
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from app.sentiment.domain.entities.sentiment_result import SentimentResult
from app.sentiment.domain.repositories.sentiment_repository import ISentimentRepository
from app.sentiment.infrastructure.spanish_lexicon import SpanishLexicon

analyzer = SentimentIntensityAnalyzer()
spanish_lexicon = SpanishLexicon()

def combined_text_score(comment: str) -> float:
    span_score = spanish_lexicon.analyze(comment)
    vader_scores = analyzer.polarity_scores(comment)
    vader_compound = vader_scores["compound"]

    if abs(span_score) > 0.01:
        return span_score * 0.7 + vader_compound * 0.3
    return vader_compound

class AnalyzeSentimentUseCase:
    def __init__(self, repository: ISentimentRepository):
        self.repository = repository

    def _classify(self, score: float, rating: int) -> str:
        text_sentiment = "POSITIVE" if score > 0.05 else "NEGATIVE" if score < -0.05 else "NEUTRAL"
        rating_sentiment = "POSITIVE" if rating >= 4 else "NEGATIVE" if rating <= 2 else "NEUTRAL"
        return text_sentiment if text_sentiment == rating_sentiment else rating_sentiment

    async def execute(self, data: dict) -> SentimentResult:
        compound = combined_text_score(data["comment"])
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