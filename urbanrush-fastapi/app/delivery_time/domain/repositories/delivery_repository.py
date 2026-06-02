from abc import ABC, abstractmethod

class IDeliveryRepository(ABC):
    @abstractmethod
    async def count_active_orders(self, vendor_id: int) -> int:
        pass