from abc import ABC, abstractmethod
from typing import List

class IAnalyticsRepository(ABC):
    @abstractmethod
    async def get_orders_by_vendor(self, vendor_id: int) -> List[dict]:
        pass

    @abstractmethod
    async def get_orders_by_vendor_since(self, vendor_id: int, days: int) -> List[dict]:
        pass