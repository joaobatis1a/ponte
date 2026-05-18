from beanie import Document
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


# --- Enums ---

class StatusDesafio(str, Enum):
    rascunho = "rascunho"
    ativo = "ativo"
    encerrado = "encerrado"


class NivelDesafio(str, Enum):
    iniciante = "iniciante"
    intermediario = "intermediario"
    avancado = "avancado"


# --- Sub-documentos ---

class Requisito(BaseModel):
    nome: str  # ex: "Figma", "Storytelling"


class Recompensa(BaseModel):
    xp: int = 0
    emblema: Optional[str] = None  # nome do emblema conquistado


# --- Documento principal ---

class Desafio(Document):
    # Empresa que criou (HU06)
    empresa_id: str

    # Informações do desafio
    titulo: str
    descricao: str
    tipo: str = "desafio"          # desafio, curso, encontro (HU03)
    status: StatusDesafio = StatusDesafio.rascunho

    # Carreira/área alvo (HU03 - filtro do feed)
    carreira: Optional[str] = None
    area_carreira: Optional[str] = None

    # Requisitos mínimos (HU06)
    requisitos: List[Requisito] = []

    # Recompensas (HU04)
    recompensa: Recompensa = Recompensa()
    nivel: NivelDesafio = NivelDesafio.iniciante

    # Dica do Manguelito (HU03, HU06)
    dica_manguelito: Optional[str] = None

    # Prazo
    prazo: Optional[date] = None

    # Controle
    criado_em: datetime = datetime.utcnow()
    atualizado_em: datetime = datetime.utcnow()

    class Settings:
        name = "desafios"