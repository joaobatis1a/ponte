from fastapi import APIRouter, HTTPException
from beanie import PydanticObjectId
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
 
from backend.models.jovem_model import Jovem, Formacao, Carreira, AreaCarreira
from backend.services.skills_service import injetar_skills, SkillsFromManguelito
 
router = APIRouter()
 
 

 
class AtualizarPerfilSchema(BaseModel):
    foto_perfil: Optional[str] = None
    carreira: Optional[Carreira] = None
    area_carreira: Optional[AreaCarreira] = None
    formacoes: Optional[List[Formacao]] = None
    cep: Optional[str] = None
 
 
 
@router.get("/{jovem_id}")
async def obter_perfil(jovem_id: str):
    """
    Retorna o perfil consolidado do jovem.
    Chave esperada pelo frontend: jovem_id
    """
    try:
        jovem = await Jovem.get(PydanticObjectId(jovem_id))
    except Exception:
        raise HTTPException(status_code=400, detail="ID de jovem inválido")
 
    if not jovem:
        raise HTTPException(status_code=404, detail="Jovem não encontrado")
 
    return {
        "jovem_id": str(jovem.id),
        "user_id": jovem.user_id,
        "nome": jovem.nome,
        "sobrenome": jovem.sobrenome,
        "foto_perfil": jovem.foto_perfil,
        "data_nascimento": str(jovem.data_nascimento) if jovem.data_nascimento else None,
        "cep": jovem.cep,
        "carreira": jovem.carreira,
        "area_carreira": jovem.area_carreira,
        "formacoes": [f.model_dump() for f in jovem.formacoes],
        "xp": jovem.xp,
        "nivel": jovem.nivel,
        "emblemas": [e.model_dump() for e in jovem.emblemas],
        "hard_skills": [s.model_dump() for s in jovem.hard_skills],
        "soft_skills": [s.model_dump() for s in jovem.soft_skills],
    }
 
 

 
@router.patch("/{jovem_id}")
async def atualizar_perfil(jovem_id: str, dados: AtualizarPerfilSchema):
    """
    Atualiza campos editáveis do perfil (foto, carreira, formações, cep).
    Apenas os campos enviados são alterados.
    """
    try:
        jovem = await Jovem.get(PydanticObjectId(jovem_id))
    except Exception:
        raise HTTPException(status_code=400, detail="ID de jovem inválido")
 
    if not jovem:
        raise HTTPException(status_code=404, detail="Jovem não encontrado")
 
    campos = dados.model_dump(exclude_none=True)
 
    if not campos:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")
 
    campos["atualizado_em"] = datetime.utcnow()
    await jovem.update({"$set": campos})
 
    return {"message": "Perfil atualizado com sucesso", "campos_atualizados": list(campos.keys())}
 
 

 
@router.post("/{jovem_id}/skills")
async def atualizar_skills(jovem_id: str, skills: SkillsFromManguelito):
    """
    Injeta hard/soft skills vindas do Manguelito (sem duplicar).
    """
    try:
        resultado = await injetar_skills(jovem_id, skills)
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))