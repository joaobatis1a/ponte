from fastapi import APIRouter, HTTPException
from beanie import PydanticObjectId
from backend.models.jovem_model import Jovem
from backend.services.skills_service import injetar_skills, SkillsFromManguelito

router = APIRouter()

@router.get("/{jovem_id}")
async def obter_perfil(jovem_id: str):
    try:
        jovem = await Jovem.get(PydanticObjectId(jovem_id))
    except Exception:
        raise HTTPException(status_code=400, detail="ID de jovem inválido")
    
    if not jovem:
        raise HTTPException(status_code=404, detail="Jovem não encontrado")
    
    nivel_formatado = jovem.nivel.value.title() if hasattr(jovem.nivel, 'value') else jovem.nivel.title()

    return {
        "nome": jovem.nome,
        "sobrenome": jovem.sobrenome,
        "nivel": nivel_formatado,
        "xp": jovem.xp
    }

@router.post("/{jovem_id}/skills")
async def atualizar_skills(jovem_id: str, skills: SkillsFromManguelito):
    try:
        resultado = await injetar_skills(jovem_id, skills)
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))