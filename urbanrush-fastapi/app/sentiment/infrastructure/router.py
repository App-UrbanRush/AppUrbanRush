from fastapi import APIRouter
from dataclasses import asdict
from app.sentiment.infrastructure.schemas import (
    SentimentRequest, SentimentResponse, SentimentReportSchema,
    CongruenceCheckRequest, CongruenceCheckResponse,
)
from app.sentiment.application.use_cases.analyze_sentiment import AnalyzeSentimentUseCase, combined_text_score
from app.sentiment.application.use_cases.get_vendor_report import GetVendorReportUseCase
from app.sentiment.infrastructure.repositories.mongo_sentiment_repository import MongoSentimentRepository

router = APIRouter()

@router.post("/analyze", response_model=SentimentResponse)
async def analyze(data: SentimentRequest):
    repository = MongoSentimentRepository()
    use_case = AnalyzeSentimentUseCase(repository)
    result = await use_case.execute(data.model_dump())
    return asdict(result)

@router.post("/check-congruence", response_model=CongruenceCheckResponse)
async def check_congruence(data: CongruenceCheckRequest):
    compound = combined_text_score(data.comment)
    text_sentiment = "POSITIVE" if compound > 0.05 else "NEGATIVE" if compound < -0.05 else "NEUTRAL"
    rating_sentiment = "POSITIVE" if data.rating >= 4 else "NEGATIVE" if data.rating <= 2 else "NEUTRAL"
    congruent = text_sentiment == rating_sentiment or text_sentiment == "NEUTRAL"
    return CongruenceCheckResponse(
        congruent=congruent,
        text_sentiment=text_sentiment,
        rating_sentiment=rating_sentiment,
    )

@router.get("/vendor/{vendor_id}/report", response_model=SentimentReportSchema)
async def report(vendor_id: int):
    repository = MongoSentimentRepository()
    use_case = GetVendorReportUseCase(repository)
    result = await use_case.execute(vendor_id)
    return asdict(result)