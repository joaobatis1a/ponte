from beanie import PydanticObjectId
from backend.models.submissao_model import Submissao, StatusSubmissao
from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


# --- Schemas de entrada ---

class CriarSubmissaoSchema(BaseModel):
    jovem_id: str
    desafio_id: str
    descricao: str
    link_externo: Optional[HttpUrl] = None


# --- Serviços ---

async def criar_submissao(dados: CriarSubmissaoSchema) -> dict:
    # Verifica se o jovem já submeteu para esse desafio
    existente = await Submissao.find_one(
        Submissao.jovem_id == dados.jovem_id,
        Submissao.desafio_id == dados.desafio_id
    )
    if existente:
        raise ValueError("Você já submeteu uma resolução para esse desafio")

    submissao = Submissao(
        jovem_id=dados.jovem_id,
        desafio_id=dados.desafio_id,
        descricao=dados.descricao,
        link_externo=dados.link_externo,
        criado_em=datetime.utcnow(),
        atualizado_em=datetime.utcnow()
    )
    await submissao.insert()

    return {
        "message": "Submissão criada com sucesso",
        "submissao_id": str(submissao.id),
        "status": submissao.status
    }


async def buscar_submissoes_por_jovem(jovem_id: str) -> list:
    submissoes = await Submissao.find(
        Submissao.jovem_id == jovem_id
    ).to_list()
    return submissoes


async def buscar_submissoes_por_desafio(desafio_id: str) -> list:
    submissoes = await Submissao.find(
        Submissao.desafio_id == desafio_id
    ).to_list()
    return submissoes