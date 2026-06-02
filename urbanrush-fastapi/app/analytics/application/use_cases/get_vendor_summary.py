from collections import Counter
from app.analytics.domain.entities.vendor_analytics import VendorSummary, TopProduct
from app.analytics.domain.repositories.analytics_repository import IAnalyticsRepository

class GetVendorSummaryUseCase:
    def __init__(self, repository: IAnalyticsRepository):
        self.repository = repository

    async def execute(self, vendor_id: int) -> VendorSummary:
        orders = await self.repository.get_orders_by_vendor(vendor_id)

        if not orders:
            return VendorSummary(0, 0, 0, [], [], {})

        total_orders = len(orders)
        total_revenue = sum(o.get("total", 0) for o in orders)
        avg_order_value = round(total_revenue / total_orders, 2)

        hours = []
        for o in orders:
            created = o.get("createdAt") or o.get("created_at")
            if created:
                hours.append(created.hour)
        peak_hours = [h for h, _ in Counter(hours).most_common(3)]

        product_counts: Counter = Counter()
        for o in orders:
            for item in o.get("items", []):
                pid = str(item.get("product_id", ""))
                product_counts[pid] += item.get("quantity", 1)

        top_products = [
            TopProduct(product_id=pid, count=count)
            for pid, count in product_counts.most_common(5)
        ]

        orders_by_status = dict(Counter(o.get("status", "UNKNOWN") for o in orders))

        return VendorSummary(
            total_orders=total_orders,
            total_revenue=total_revenue,
            avg_order_value=avg_order_value,
            peak_hours=peak_hours,
            top_products=top_products,
            orders_by_status=orders_by_status
        )