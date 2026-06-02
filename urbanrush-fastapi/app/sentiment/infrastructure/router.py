from fastapi import APIRouter
from dataclasses import asdict
from app.sentiment.infrastructure.schemas import SentimentRequest, SentimentResponse, SentimentReportSchema
from app.sentiment.application.use_cases.analyze_sentiment import AnalyzeSentimentUseCase
from app.sentiment.application.use_cases.get_vendor_report import GetVendorReportUseCase
from app.sentiment.infrastructure.repositories.mongo_sentiment_repository import MongoSentimentRepository

router = APIRouter()

@router.post("/analyze", response_model=SentimentResponse)
async def analyze(data: SentimentRequest):
    repository = MongoSentimentRepository()
    use_case = AnalyzeSentimentUseCase(repository)
    result = await use_case.execute(data.model_dump())
    return asdict(result)

@router.get("/vendor/{vendor_id}/report", response_model=SentimentReportSchema)
async def report(vendor_id: int):
    repository = MongoSentimentRepository()
    use_case = GetVendorReportUseCase(repository)
    result = await use_case.execute(vendor_id)
    return asdict(result)