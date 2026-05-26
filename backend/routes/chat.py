from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
import httpx
 
from beanie import PydanticObjectId
from backend.models.jovem_model import Jovem
from backend.services.skills_service import injetar_skills, SkillsFromManguelito
 
router = APIRouter()
 
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
 
LIMITE_SEMANAL = 10
 
 
 
class ChatMensagemSchema(BaseModel):
    jovem_id: str
    mensagem: str
 
 
 
@router.post("/mensagem")
async def enviar_mensagem(dados: ChatMensagemSchema):

    try:
        jovem = await Jovem.get(PydanticObjectId(dados.jovem_id))
    except Exception:
        raise HTTPException(status_code=400, detail="ID de jovem inválido")
 
    if not jovem:
        raise HTTPException(status_code=404, detail="Jovem não encontrado")
 
    agora = datetime.utcnow()
    if jovem.ultima_resetagem_mensagens is None or (
        agora - jovem.ultima_resetagem_mensagens >= timedelta(days=7)
    ):
        jovem.mensagens_semana = 0
        jovem.ultima_resetagem_mensagens = agora
 
    if jovem.mensagens_semana >= LIMITE_SEMANAL:
        raise HTTPException(
            status_code=429,
            detail=f"Limite semanal de {LIMITE_SEMANAL} mensagens atingido.",
        )
 

    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY não configurada")
 
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": dados.mensagem}],
        "temperature": 0.7,
        "max_tokens": 512,
    }
 
    print(f"\n[Chat-Debug] Enviando mensagem para a Groq (Modelo: {GROQ_MODEL})...")
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                GROQ_API_URL,
                json=payload,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
            )
    except httpx.RequestError as e:
        print(f"[Chat-Debug] ERRO DE REDE: Falha ao contatar a API da Groq: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Erro ao chamar a IA: {str(e)}")
 
    if response.status_code != 200:
        print(f"[Chat-Debug] A GROQ RECUSOU A REQUISIÇÃO! Status: {response.status_code} | Detalhe: {response.text}")
        raise HTTPException(status_code=502, detail=f"Erro da IA: {response.text}")
 
    resposta_ia = response.json()["choices"][0]["message"]["content"].strip()
    print(f"[Chat-Debug] Resposta gerada pela Groq com sucesso: {resposta_ia}")

    print(f"[Chat-Debug] Acionando injeção de skills no BD para o Jovem: {dados.jovem_id}")
 
    resposta_ia = response.json()["choices"][0]["message"]["content"].strip()
    print(f"\n[Chat-Debug] Resposta gerada pela Groq: {resposta_ia}")

    print(f"[Chat-Debug] Acionando injeção de skills no BD para o Jovem: {dados.jovem_id}")
    await injetar_skills(
        dados.jovem_id,
        SkillsFromManguelito(hard_skills=[], soft_skills=[]),
    )
 

    await injetar_skills(
        dados.jovem_id,
        SkillsFromManguelito(hard_skills=[], soft_skills=[]),
    )
 

    await jovem.update({
        "$set": {
            "mensagens_semana": jovem.mensagens_semana + 1,
            "ultima_resetagem_mensagens": jovem.ultima_resetagem_mensagens,
            "atualizado_em": agora,
        }
    })
 
    return {"resposta": resposta_ia}