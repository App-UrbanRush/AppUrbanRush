from app.fraud.domain.entities.fraud_result import FraudResult
from app.fraud.domain.repositories.fraud_repository import IFraudRepository

class AnalyzeFraudUseCase:
    def __init__(self, repository: IFraudRepository):
        self.repository = repository

    async def execute(self, data: dict) -> FraudResult:
        reasons = []
        risk_score = 0.0

        # Regla 1: monto muy alto (> $500.000 COP)
        if data["amount"] > 50_000_000:
            risk_score += 0.3
            reasons.append("Monto inusualmente alto")

        # Regla 2: muchos pedidos en la última hora
        recent_orders = await self.repository.count_recent_orders(data["user_id"], minutes=60)
        if recent_orders >= 3:
            risk_score += 0.3
            reasons.append(f"Múltiples pedidos en poco tiempo ({recent_orders} en 1 hora)")

        # Regla 3: primer pago del usuario
        total_payments = await self.repository.count_total_payments(data["user_id"])
        if total_payments == 0:
            risk_score += 0.1
            reasons.append("Primer pago del usuario")

        # Regla 4: dirección nueva con historial previo
        previous_addresses = await self.repository.get_previous_addresses(data["user_id"])
        if data["delivery_address"] not in previous_addresses and total_payments > 2:
            risk_score += 0.2
            reasons.append("Dirección de entrega nueva para usuario con historial")

        # Regla 5: tarjeta con monto alto
        if data["payment_method"] == "CARD" and data["amount"] > 20_000_000:
            risk_score += 0.1
            reasons.append("Pago con tarjeta de monto elevado")

        risk_score = min(round(risk_score, 2), 1.0)

        return FraudResult(
            is_suspicious=risk_score >= 0.5,
            risk_score=risk_score,
            reasons=reasons if reasons else ["Sin señales de riesgo detectadas"]
        )