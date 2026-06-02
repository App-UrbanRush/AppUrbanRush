from abc import ABC, abstractmethod
from typing import List

class IFraudRepository(ABC):
    @abstractmethod
    async def count_recent_orders(self, user_id: int, minutes: int) -> int:
        pass

    @abstractmethod
    async def count_total_payments(self, user_id: int) -> int:
        pass

    @abstractmethod
    async def get_previous_addresses(self, user_id: int) -> List[str]:
        pass