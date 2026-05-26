from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import os

# 1. CARREGA AS VARIÁVEIS ANTES DE IMPORTAR OS ARQUIVOS DO PROJETO
load_dotenv()

# 2. Importações dos Modelos
from backend.models.user_model import User
from backend.models.jovem_model import Jovem
from backend.models.task_model import Desafio
from backend.models.submissao_model import Submissao

# Importação do Serviço de Seed
from backend.services.seed_service import popular_desafios_mock

# Importações das Rotas
from backend.routes import auth, chat, feed, profile

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ponte-mvp")

if not MONGODB_URL:
    raise ValueError("⚠️ ERRO: MONGODB_URL não encontrada! Verifique o seu arquivo .env na raiz do projeto.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n[Inicialização] Conectando ao MongoDB...")
    client = AsyncIOMotorClient(MONGODB_URL)
    await init_beanie(database=client[DATABASE_NAME], document_models=[User, Jovem, Desafio, Submissao])
    print("[Inicialização] Modelos registrados com sucesso.")
    
    print("[Inicialização] Executando Seed de Desafios...")
    await popular_desafios_mock()
    print("[Inicialização] Servidor Pronto para requisições.\n")
    yield
    client.close()


app = FastAPI(
    title="Ponte MVP API",
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

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(feed.router, prefix="/feed", tags=["Feed"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])


@app.get("/")
async def root():
    return {"status": "Ponte API rodando de forma estável!"}