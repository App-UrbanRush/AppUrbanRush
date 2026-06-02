from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class TopProduct:
    product_id: str
    count: int

@dataclass
class VendorSummary:
    total_orders: int
    total_revenue: float
    avg_order_value: float
    peak_hours: List[int]
    top_products: List[TopProduct]
    orders_by_status: Dict[str, int]

@dataclass
class DailyStats:
    date: str
    orders: int
    revenue: float