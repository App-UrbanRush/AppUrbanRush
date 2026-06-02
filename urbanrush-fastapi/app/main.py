from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_db, close_db
from app.delivery_time.infrastructure.router import router as delivery_router
from app.fraud.infrastructure.router import router as fraud_router
from app.analytics.infrastructure.router import router as analytics_router
from app.sentiment.infrastructure.router import router as sentiment_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(
    title="UrbanRush Intelligence API",
    description="Microservicio de inteligencia y analytics para UrbanRush",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(delivery_router, prefix="/delivery-time", tags=["Delivery Time"])
app.include_router(fraud_router, prefix="/fraud", tags=["Fraud Detection"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
app.include_router(sentiment_router, prefix="/sentiment", tags=["Sentiment"])

@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "UrbanRush Intelligence API"}