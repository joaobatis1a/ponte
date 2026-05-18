from fastapi import APIRouter, HTTPException
from backend.services.skills_service import injetar_skills, SkillsFromManguelito

router = APIRouter()


@router.post("/{jovem_id}/skills")
async def atualizar_skills(jovem_id: str, skills: SkillsFromManguelito):
    try:
        resultado = await injetar_skills(jovem_id, skills)
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))