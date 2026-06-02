from pydantic import BaseModel
from typing import Literal

class DeliveryTimeRequest(BaseModel):
    order_id: str
    vendor_id: int
    delivery_address: str
    total_items: int

class DeliveryTimeResponse(BaseModel):
    estimated_minutes: int
    confidence: Literal["HIGH", "MEDIUM", "LOW"]
    breakdown: dict