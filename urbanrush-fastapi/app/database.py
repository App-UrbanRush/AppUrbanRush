from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_URI

client: AsyncIOMotorClient = None

async def connect_db():
    global client
    client = AsyncIOMotorClient(MONGO_URI)
    print("✅ Conectado a MongoDB")

async def close_db():
    global client
    if client:
        client.close()
        print("❌ Desconectado de MongoDB")

def get_db():
    return client["urbanrush"]