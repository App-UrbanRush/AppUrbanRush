from fastapi import APIRouter
from app.fraud.infrastructure.schemas import FraudRequest, FraudResponse
from app.fraud.application.use_cases.analyze_fraud import AnalyzeFraudUseCase
from app.fraud.infrastructure.repositories.mongo_fraud_repository import MongoFraudRepository

router = APIRouter()

@router.post("/analyze", response_model=FraudResponse)
async def analyze(data: FraudRequest):
    repository = MongoFraudRepository()
    use_case = AnalyzeFraudUseCase(repository)
    result = await use_case.execute(data.model_dump())
    return result