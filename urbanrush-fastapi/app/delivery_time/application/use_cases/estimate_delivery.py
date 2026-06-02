from datetime import datetime
from app.delivery_time.domain.entities.delivery_estimate import DeliveryEstimate
from app.delivery_time.domain.repositories.delivery_repository import IDeliveryRepository

class EstimateDeliveryUseCase:
    def __init__(self, repository: IDeliveryRepository):
        self.repository = repository

    async def execute(self, data: dict) -> DeliveryEstimate:
        current_hour = datetime.now().hour
        is_peak_hour = current_hour in [12, 13, 18, 19, 20]

        active_orders = await self.repository.count_active_orders(data["vendor_id"])

        base_time = 15
        items_time = min(data["total_items"] * 2, 10)
        load_time = min(active_orders * 3, 15)
        peak_time = 10 if is_peak_hour else 0
        delivery_time = 20

        total = base_time + items_time + load_time + peak_time + delivery_time

        if active_orders < 3 and not is_peak_hour:
            confidence = "HIGH"
        elif active_orders < 6:
            confidence = "MEDIUM"
        else:
            confidence = "LOW"

        return DeliveryEstimate(
            estimated_minutes=total,
            confidence=confidence,
            breakdown={
                "base_preparation": base_time,
                "items_complexity": items_time,
                "vendor_load": load_time,
                "peak_hour_delay": peak_time,
                "delivery_transit": delivery_time
            }
        )