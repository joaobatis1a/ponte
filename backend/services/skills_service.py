from beanie import PydanticObjectId
from backend.models.jovem_model import Jovem, HardSkill, SoftSkill
from pydantic import BaseModel
from typing import List




class SkillsFromManguelito(BaseModel):
    hard_skills: List[str] = []
    soft_skills: List[str] = []




async def injetar_skills(jovem_id: str, skills: SkillsFromManguelito) -> dict:
    jovem = await Jovem.get(PydanticObjectId(jovem_id))
    if not jovem:
        raise ValueError("Jovem não encontrado")

   
    hard_existentes = {s.nome for s in jovem.hard_skills}
    soft_existentes = {s.nome for s in jovem.soft_skills}

    
    novas_hard = [
        HardSkill(nome=nome) for nome in skills.hard_skills
        if nome not in hard_existentes
    ]
    novas_soft = [
        SoftSkill(nome=nome) for nome in skills.soft_skills
        if nome not in soft_existentes
    ]

   
    await jovem.update(
        {"$push": {
            "hard_skills": {"$each": [s.model_dump() for s in novas_hard]},
            "soft_skills": {"$each": [s.model_dump() for s in novas_soft]}
        }}
    )

    return {
        "message": "Skills atualizadas com sucesso",
        "hard_skills_adicionadas": [s.nome for s in novas_hard],
        "soft_skills_adicionadas": [s.nome for s in novas_soft]
    }