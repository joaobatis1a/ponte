from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv
import os

from backend.models.user_model import User
from backend.models.jovem_model import Jovem
from backend.models.task_model import Desafio

from backend.routes import auth, chat, feed, profile

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ponte-mvp")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Conecta ao MongoDB na inicialização
    client = AsyncIOMotorClient(MONGODB_URL)
    await init_beanie(
        database=client[DATABASE_NAME],
        document_models=[User, Jovem, Desafio]
    )
    yield
    # Fecha conexão ao encerrar
    client.close()


app = FastAPI(
    title="Ponte MVP API",
    version="1.0.0",
    lifespan=lifespan
)


# --- Rotas ---
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(feed.router, prefix="/feed", tags=["Feed"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])


@app.get("/")
async def root():
    return {"status": "Ponte API rodando!"}