from pydantic import BaseModel
from typing import List

class FraudRequest(BaseModel):
    user_id: int
    order_id: str
    amount: int
    payment_method: str
    delivery_address: str

class FraudResponse(BaseModel):
    is_suspicious: bool
    risk_score: float
    reasons: List[str]