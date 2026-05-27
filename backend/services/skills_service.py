from beanie import PydanticObjectId
from backend.models.jovem_model import Jovem, Habilidade
from pydantic import BaseModel
from typing import List
from datetime import datetime

class SkillsFromManguelito(BaseModel):
    habilidades: List[str] = []

async def injetar_skills(jovem_id: str, skills: SkillsFromManguelito) -> dict:
    jovem = await Jovem.get(PydanticObjectId(jovem_id))
    if not jovem:
        raise ValueError("Jovem não encontrado")

    novas_habilidades = [
        Habilidade(nome=nome).model_dump() for nome in skills.habilidades[:3]
    ]

    if novas_habilidades:
        await jovem.update({
            "$addToSet": {
                "habilidades": {"$each": novas_habilidades}
            },
            "$set": {
                "atualizado_em": datetime.utcnow()
            }
        })

    return {
        "message": "Habilidades atualizadas com sucesso",
        "habilidades_adicionadas": skills.habilidades[:3]
    }