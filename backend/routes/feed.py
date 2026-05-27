from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from backend.models.submissao_model import Submissao

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
    print("\n================ DEBUG DO FEED ================")
    
    # 1. Conta absolutamente TUDO que tem na coleção de desafios
    total_banco = await Desafio.find_all().count()
    print(f"[Feed-Debug] Total de desafios brutos no MongoDB: {total_banco}")
    
    # 2. Busca ignorando os filtros para ver se o problema é o status
    desafios_sem_filtro = await Desafio.find_all().to_list()
    for d in desafios_sem_filtro:
        print(f" -> Encontrado no BD: {d.titulo} | Status: {d.status}")

    # 3. Aplica o filtro original da aplicação
    filtros = {"status": StatusDesafio.ativo}
    if carreira: filtros["carreira"] = carreira
    if area_carreira: filtros["area_carreira"] = area_carreira
    if nivel: filtros["nivel"] = nivel
 
    desafios_finais = await Desafio.find(filtros).skip(skip).limit(limit).to_list()
    print(f"[Feed-Debug] Total de desafios após aplicar o filtro 'Ativo': {len(desafios_finais)}")
    print("===============================================\n")
 
    return {
        "total": len(desafios_finais),
        "desafios": [
            {
                "desafio_id": str(d.id),
                "empresa_id": d.empresa_id,
                "titulo": d.titulo,
                "descricao_curta": d.descricao_curta or d.descricao,
                "tipo": d.tipo,
                "carreira": d.carreira,
                "area_carreira": d.area_carreira,
                "nivel": d.nivel.value if hasattr(d.nivel, 'value') else d.nivel,
                "requisitos": [r.model_dump() for r in d.requisitos],
                "entregaveis": [e.model_dump() for e in d.entregaveis],
                "recompensa": d.recompensa.model_dump(),
                "dica_manguelito": d.dica_manguelito,
                "total_participantes": d.total_participantes,
                "prazo": str(d.prazo) if d.prazo else None,
                "criado_em": d.criado_em.isoformat(),
            }
            for d in desafios_finais
        ],
    }

@router.get("/desafios/{desafio_id}")
async def obter_detalhes_desafio(desafio_id: str):
    print(f"\n[Feed-Debug] Buscando detalhes do desafio ID: {desafio_id}")
    try:
        desafio = await Desafio.get(PydanticObjectId(desafio_id))
    except Exception:
        raise HTTPException(status_code=400, detail="ID de desafio inválido")
        
    if not desafio:
        raise HTTPException(status_code=404, detail="Desafio não encontrado")
    
    # Extrai iniciais do empresa_id (ex: "empresa_solvex" -> "SL")
    empresa_initials = desafio.empresa_id.replace("empresa_", "").upper()[:2] if desafio.empresa_id else "XX"
    
    empresa_info = desafio.empresa_info.model_dump() if desafio.empresa_info else {
        "nome": "Empresa Confidencial",
        "initialiais": empresa_initials,
        "localizacao": "Pernambuco",
        "bio": "Uma empresa parceira da P.O.N.T.E.",
        "url_perfil": "#"
    }
        
    return {
        "desafio_id": str(desafio.id),
        "empresa_id": desafio.empresa_id,
        "empresa_info": empresa_info,
        "titulo": desafio.titulo,
        "descricao_longa": desafio.descricao_longa or desafio.descricao,
        "tipo": desafio.tipo,
        "carreira": desafio.carreira,
        "area_carreira": desafio.area_carreira,
        "nivel": desafio.nivel.value if hasattr(desafio.nivel, 'value') else desafio.nivel,
        "requisitos": [r.model_dump() for r in desafio.requisitos],
        "entregaveis": [e.model_dump() for e in desafio.entregaveis],
        "recompensa": desafio.recompensa.model_dump(),
        "dica_manguelito": desafio.dica_manguelito,
        "total_participantes": desafio.total_participantes,
        "prazo": str(desafio.prazo) if desafio.prazo else "Sem prazo",
        "criado_em": desafio.criado_em.isoformat(),
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

# --- NOVAS ROTAS DE ESTADO DO DESAFIO ---

class AceitarDesafioSchema(BaseModel):
    jovem_id: str

@router.post("/desafios/{desafio_id}/aceitar")
async def aceitar_desafio(desafio_id: str, dados: AceitarDesafioSchema):
    jovem = await Jovem.get(PydanticObjectId(dados.jovem_id))
    if not jovem:
        raise HTTPException(status_code=404, detail="Jovem não encontrado")
    
    # Salva o desafio no perfil do jovem se ainda não estiver lá
    if desafio_id not in jovem.desafios_aceitos:
        jovem.desafios_aceitos.append(desafio_id)
        await jovem.save()
        
    return {"message": "Desafio salvo no perfil com sucesso!"}


@router.get("/desafios/{desafio_id}/status")
async def status_desafio(desafio_id: str, jovem_id: str = Query(...)):
    jovem = await Jovem.get(PydanticObjectId(jovem_id))
    if not jovem:
        raise HTTPException(status_code=404, detail="Jovem não encontrado")
        
    aceito = desafio_id in jovem.desafios_aceitos
    
    # Procura no banco se já existe uma submissão para este par (Jovem + Desafio)
    submissao = await Submissao.find_one(
        Submissao.desafio_id == desafio_id,
        Submissao.jovem_id == jovem_id
    )
    
    dados_submissao = None
    if submissao:
        dados_submissao = {
            "id": str(submissao.id),
            "link_externo": submissao.link_externo,
            "descricao": submissao.descricao
        }
        
    return {"aceito": aceito, "submissao": dados_submissao}


@router.delete("/submissao/{submissao_id}")
async def deletar_submissao(submissao_id: str):
    submissao = await Submissao.get(PydanticObjectId(submissao_id))
    if not submissao:
        raise HTTPException(status_code=404, detail="Submissão não encontrada")
        
    await submissao.delete()
    return {"message": "Submissão excluída com sucesso"}