from pydantic import BaseModel, Field
from typing import List, Literal, Dict

class SentimentRequest(BaseModel):
    order_id: str
    vendor_id: int
    rating: int = Field(ge=1, le=5)
    comment: str

class SentimentResponse(BaseModel):
    sentiment: Literal["POSITIVE", "NEUTRAL", "NEGATIVE"]
    score: float
    saved: bool

class CongruenceCheckRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str

class CongruenceCheckResponse(BaseModel):
    congruent: bool
    text_sentiment: Literal["POSITIVE", "NEUTRAL", "NEGATIVE"]
    rating_sentiment: Literal["POSITIVE", "NEUTRAL", "NEGATIVE"]

class SentimentReportSchema(BaseModel):
    avg_rating: float
    total_reviews: int
    sentiment_distribution: Dict[str, int]
    recent_comments: List[dict]