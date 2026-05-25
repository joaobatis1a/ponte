from beanie import PydanticObjectId
from backend.models.jovem_model import Jovem, HardSkill, SoftSkill
from pydantic import BaseModel
from typing import List


# --- Schemas de entrada ---

class SkillsFromManguelito(BaseModel):
    hard_skills: List[str] = []
    soft_skills: List[str] = []


# --- Serviços ---

async def injetar_skills(jovem_id: str, skills: SkillsFromManguelito) -> dict:
    jovem = await Jovem.get(PydanticObjectId(jovem_id))
    if not jovem:
        raise ValueError("Jovem não encontrado")

    await jovem.update({
        "$addToSet": {
            "hard_skills": {
                "$each": [{"nome": nome, "origem": "manguelito"} for nome in skills.hard_skills]
            },
            "soft_skills": {
                "$each": [{"nome": nome, "origem": "manguelito"} for nome in skills.soft_skills]
            }
        }
    })

    jovem_atualizado = await Jovem.get(PydanticObjectId(jovem_id))

    return {
        "message": "Skills atualizadas com sucesso",
        "hard_skills": [s.nome for s in jovem_atualizado.hard_skills],
        "soft_skills": [s.nome for s in jovem_atualizado.soft_skills]
    }