from fastapi import APIRouter, Query
from typing import List
from app.analytics.infrastructure.schemas import VendorSummarySchema, DailyStatsSchema
from app.analytics.application.use_cases.get_vendor_summary import GetVendorSummaryUseCase
from app.analytics.application.use_cases.get_vendor_daily import GetVendorDailyUseCase
from app.analytics.infrastructure.repositories.mongo_analytics_repository import MongoAnalyticsRepository
from dataclasses import asdict

router = APIRouter()

@router.get("/vendor/{vendor_id}/summary", response_model=VendorSummarySchema)
async def summary(vendor_id: int):
    repository = MongoAnalyticsRepository()
    use_case = GetVendorSummaryUseCase(repository)
    result = await use_case.execute(vendor_id)
    return asdict(result)

@router.get("/vendor/{vendor_id}/daily", response_model=List[DailyStatsSchema])
async def daily(vendor_id: int, days: int = Query(default=30, ge=1, le=90)):
    repository = MongoAnalyticsRepository()
    use_case = GetVendorDailyUseCase(repository)
    result = await use_case.execute(vendor_id, days)
    return [asdict(r) for r in result]