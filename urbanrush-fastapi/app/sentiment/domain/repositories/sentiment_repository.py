from abc import ABC, abstractmethod
from typing import List

class ISentimentRepository(ABC):
    @abstractmethod
    async def save_review(self, review: dict) -> None:
        pass

    @abstractmethod
    async def get_reviews_by_vendor(self, vendor_id: int) -> List[dict]:
        pass