from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime

from beanie import PydanticObjectId
from backend.models.task_model import Desafio, StatusDesafio
from backend.models.jovem_model import Jovem

from backend.services.submissao_service import criar_submissao, CriarSubmissaoSchema

router = APIRouter()

@router.get("/desafios")
async def listar_desafios(
    carreira: Optional[str] = Query(None),
    area_carreira: Optional[str] = Query(None),
    nivel: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
):
    print("\n[Feed-Debug] Requisição GET /desafios recebida. Buscando no Mongo...")
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
async def submeter_resolucao(dados: CriarSubmissaoSchema):
    print(f"\n[Submissao-Debug] Requisição POST recebida. Jovem: {dados.jovem_id} | Desafio: {dados.desafio_id}")
    if not dados.link_externo and not dados.descricao:
        raise HTTPException(
            status_code=400,
            detail="Informe ao menos um campo: 'link_externo' ou 'descricao'",
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
    
    print(f"[Submissao-Debug] Validações aprovadas. Acionando submissao_service para persistência no MongoDB.")
 
    try:
        resultado = await criar_submissao(dados)
        print(f"[Submissao-Debug] Submissão salva com sucesso no BD! ID: {resultado['submissao_id']}")
    except ValueError as e:
        print(f"[Submissao-Debug] Erro no serviço: {e}")
        raise HTTPException(status_code=400, detail=str(e))
 
    return resultado