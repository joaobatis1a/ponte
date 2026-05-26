from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
 
from beanie import PydanticObjectId
from backend.models.task_model import Desafio, StatusDesafio
from backend.models.jovem_model import Jovem
 
router = APIRouter()
 
 

 
class SubmissaoSchema(BaseModel):
    jovem_id: str
    desafio_id: str
    link: Optional[str] = None
    texto: Optional[str] = None
 
 

 
@router.get("/desafios")
async def listar_desafios(
    carreira: Optional[str] = Query(None),
    area_carreira: Optional[str] = Query(None),
    nivel: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
):
    filtros = {"status": StatusDesafio.ativo}
 
    if carreira:
        filtros["carreira"] = carreira
    if area_carreira:
        filtros["area_carreira"] = area_carreira
    if nivel:
        filtros["nivel"] = nivel
 
    desafios = await Desafio.find(filtros).skip(skip).limit(limit).to_list()
 
    return {
        "total": len(desafios),
        "desafios": [
            {
                "desafio_id": str(d.id),
                "empresa_id": d.empresa_id,
                "titulo": d.titulo,
                "descricao": d.descricao,
                "tipo": d.tipo,
                "carreira": d.carreira,
                "area_carreira": d.area_carreira,
                "nivel": d.nivel,
                "requisitos": [r.model_dump() for r in d.requisitos],
                "recompensa": d.recompensa.model_dump(),
                "dica_manguelito": d.dica_manguelito,
                "prazo": str(d.prazo) if d.prazo else None,
                "criado_em": d.criado_em.isoformat(),
            }
            for d in desafios
        ],
    }
 
 

 
@router.post("/submissao")
async def submeter_resolucao(dados: SubmissaoSchema):
    if not dados.link and not dados.texto:
        raise HTTPException(
            status_code=400,
            detail="Informe ao menos um campo: 'link' ou 'texto'",
        )
 
    try:
        jovem = await Jovem.get(PydanticObjectId(dados.jovem_id))
    except Exception:
        raise HTTPException(status_code=400, detail="ID de jovem inválido")
 
    if not jovem:
        raise HTTPException(status_code=404, detail="Jovem não encontrado")
 
    try:
        desafio = await Desafio.get(PydanticObjectId(dados.desafio_id))
    except Exception:
        raise HTTPException(status_code=400, detail="ID de desafio inválido")
 
    if not desafio:
        raise HTTPException(status_code=404, detail="Desafio não encontrado")
 
    if desafio.status != StatusDesafio.ativo:
        raise HTTPException(status_code=400, detail="Este desafio não está mais ativo")
 
    return {
        "message": "Submissão recebida com sucesso!",
        "jovem_id": dados.jovem_id,
        "desafio_id": dados.desafio_id,
        "link_enviado": dados.link,
        "texto_enviado": bool(dados.texto),
        "submetido_em": datetime.utcnow().isoformat(),
    }