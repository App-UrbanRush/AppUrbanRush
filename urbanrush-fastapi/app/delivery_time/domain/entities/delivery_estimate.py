from dataclasses import dataclass
from typing import Literal

@dataclass
class DeliveryEstimate:
    estimated_minutes: int
    confidence: Literal["HIGH", "MEDIUM", "LOW"]
    breakdown: dict