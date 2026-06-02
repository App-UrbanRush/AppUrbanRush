from fastapi import APIRouter
from app.delivery_time.infrastructure.schemas import DeliveryTimeRequest, DeliveryTimeResponse
from app.delivery_time.application.use_cases.estimate_delivery import EstimateDeliveryUseCase
from app.delivery_time.infrastructure.repositories.mongo_delivery_repository import MongoDeliveryRepository

router = APIRouter()

@router.post("/estimate", response_model=DeliveryTimeResponse)
async def estimate(data: DeliveryTimeRequest):
    repository = MongoDeliveryRepository()
    use_case = EstimateDeliveryUseCase(repository)
    result = await use_case.execute(data.model_dump())
    return result