from dataclasses import dataclass, field
from typing import List, Literal, Dict

@dataclass
class SentimentResult:
    sentiment: Literal["POSITIVE", "NEUTRAL", "NEGATIVE"]
    score: float
    saved: bool

@dataclass
class SentimentReport:
    avg_rating: float
    total_reviews: int
    sentiment_distribution: Dict[str, int]
    recent_comments: List[dict] = field(default_factory=list)