from pydantic import BaseModel
from typing import List, Dict

class TopProductSchema(BaseModel):
    product_id: str
    count: int

class VendorSummarySchema(BaseModel):
    total_orders: int
    total_revenue: float
    avg_order_value: float
    peak_hours: List[int]
    top_products: List[TopProductSchema]
    orders_by_status: Dict[str, int]

class DailyStatsSchema(BaseModel):
    date: str
    orders: int
    revenue: float