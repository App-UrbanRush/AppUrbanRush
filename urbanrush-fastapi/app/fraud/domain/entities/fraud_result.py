from dataclasses import dataclass, field
from typing import List

@dataclass
class FraudResult:
    is_suspicious: bool
    risk_score: float
    reasons: List[str] = field(default_factory=list)