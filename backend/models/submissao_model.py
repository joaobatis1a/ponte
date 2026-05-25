from beanie import Document, Indexed
from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum


class StatusSubmissao(str, Enum):
    pendente = "Pendente"
    em_avaliacao = "Em Avaliação"
    avaliado = "Avaliado"


class Submissao(Document):
    # Relacionamentos (indexados para performance)
    jovem_id: Indexed(str)
    desafio_id: Indexed(str)

    # Carga de dados da resolução
    descricao: str
    link_externo: Optional[HttpUrl] = None

    # Status
    status: StatusSubmissao = StatusSubmissao.pendente

    # Avaliação (preenchido depois pela empresa)
    nota: Optional[float] = None
    feedback: Optional[str] = None

    # Controle
    criado_em: datetime = datetime.utcnow()
    atualizado_em: datetime = datetime.utcnow()

    @field_validator("nota")
    @classmethod
    def validar_nota(cls, v):
        if v is not None and not (0 <= v <= 10):
            raise ValueError("Nota deve ser entre 0 e 10")
        return v

    class Settings:
        name = "submissoes"