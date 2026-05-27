from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
import httpx
import json

from beanie import PydanticObjectId
from backend.models.jovem_model import Jovem
from backend.services.skills_service import injetar_skills, SkillsFromManguelito

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

LIMITE_SEMANAL = 10

SYSTEM_PROMPT = """Você é o Manguelito, um assistente virtual carismático recifense.
Objetivo: extrair experiências do jovem e convertê-las em habilidades profissionais (mínimo 1, máximo 3).

CENÁRIO A (Resposta detalhada na 1ª mensagem):
- Ação: "finalizar_conversa": true
- Fala: "Ah, então tu desenrola [habilidades]? Massa demais! Armazenei aqui e já incluí isso no teu perfil. Pode aproveitar o site agora, boy!"
- Extraia de 1 a 3 habilidades.

CENÁRIO B (Resposta rasa na 1ª mensagem):
- Ação: "finalizar_conversa": false
- Fala: Faça UMA pergunta específica.
- Habilidades: Retorne array vazio [].

JSON OBRIGATÓRIO DE SAÍDA:
{
    "fala_manguelito": "Sua fala",
    "finalizar_conversa": true/false,
    "habilidades": ["Hab 1", "Hab 2"]
}"""

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
    if jovem.ultima_resetagem_mensagens is None or (agora - jovem.ultima_resetagem_mensagens >= timedelta(days=7)):
        jovem.mensagens_semana = 0
        jovem.ultima_resetagem_mensagens = agora

    if jovem.mensagens_semana >= LIMITE_SEMANAL:
        raise HTTPException(status_code=429, detail=f"Limite atingido.")

    # HANDLER DE ESTADO (Força o encerramento no segundo turno)
    instrucao_extra = ""
    if jovem.mensagens_semana >= 1:
        instrucao_extra = "\n[ALERTA DO SISTEMA: ESTA É A SUA SEGUNDA E ÚLTIMA INTERAÇÃO COM ESTE USUÁRIO. VOCÊ ESTÁ ESTRITAMENTE PROIBIDO DE FAZER PERGUNTAS. VOCÊ DEVE OBRIGATORIAMENTE DEFINIR 'finalizar_conversa': true, USAR A FALA DE ENCERRAMENTO DO CENÁRIO A, E EXTRAIR AS HABILIDADES AGORA]."

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT + instrucao_extra},
            {"role": "user", "content": dados.mensagem}
        ],
        "temperature": 0.6,
        "max_tokens": 512,
        "response_format": {"type": "json_object"}
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                GROQ_API_URL, json=payload,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
            )
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Erro de rede: {str(e)}")

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Erro IA: {response.text}")

    resposta_ia_str = response.json()["choices"][0]["message"]["content"].strip()
    
    try:
        dados_ia = json.loads(resposta_ia_str)
        fala_manguelito = dados_ia.get("fala_manguelito", "Oxe, buguei. Conta de novo!")
        novas_habilidades = dados_ia.get("habilidades", [])
        finalizar = dados_ia.get("finalizar_conversa", False)
    except json.JSONDecodeError:
        fala_manguelito = "Deu curto-circuito aqui. Fala de novo?"
        novas_habilidades = []
        finalizar = False

    # Executa a injeção
    await injetar_skills(
        dados.jovem_id,
        SkillsFromManguelito(habilidades=novas_habilidades)
    )

    # Incrementa o Handler
    await jovem.update({
        "$set": {
            "mensagens_semana": jovem.mensagens_semana + 1,
            "ultima_resetagem_mensagens": jovem.ultima_resetagem_mensagens,
            "atualizado_em": agora,
        }
    })

    return {
        "resposta": fala_manguelito,
        "finalizar_conversa": finalizar
    }