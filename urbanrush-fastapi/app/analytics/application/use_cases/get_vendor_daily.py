from app.analytics.domain.entities.vendor_analytics import DailyStats
from app.analytics.domain.repositories.analytics_repository import IAnalyticsRepository
from typing import List

class GetVendorDailyUseCase:
    def __init__(self, repository: IAnalyticsRepository):
        self.repository = repository

    async def execute(self, vendor_id: int, days: int) -> List[DailyStats]:
        orders = await self.repository.get_orders_by_vendor_since(vendor_id, days)

        daily: dict = {}
        for o in orders:
            created = o.get("createdAt") or o.get("created_at")
            if not created:
                continue
            date_str = created.strftime("%Y-%m-%d")
            if date_str not in daily:
                daily[date_str] = {"orders": 0, "revenue": 0.0}
            daily[date_str]["orders"] += 1
            daily[date_str]["revenue"] += o.get("total", 0)

        return [
            DailyStats(date=date, orders=v["orders"], revenue=round(v["revenue"], 2))
            for date, v in sorted(daily.items())
        ]