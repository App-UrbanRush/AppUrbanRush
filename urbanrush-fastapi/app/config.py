from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/urbanrush")
FASTAPI_PORT = int(os.getenv("FASTAPI_PORT", 8000))
NESTJS_BASE_URL = os.getenv("NESTJS_BASE_URL", "http://localhost:3000")