from backend.models.user_model import User, TipoUsuario
from backend.models.jovem_model import Jovem, Formacao
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import bcrypt

# Espelho exato do que o frontend (api.js) manda
class CadastroJovemSchema(BaseModel):
    nome: str
    sobrenome: str
    email: EmailStr
    senha: str
    idade: Optional[int] = None
    bairro: Optional[str] = None
    formacoes: List[Formacao] = []
    foto_perfil: Optional[str] = None

async def cadastrar_jovem(dados: CadastroJovemSchema) -> dict:
    usuario_existente = await User.find_one(User.email == dados.email)
    if usuario_existente:
        raise ValueError("Email já cadastrado")

    senha_hash = bcrypt.hashpw(dados.senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user = User(
        email=dados.email,
        senha_hash=senha_hash,
        tipo=TipoUsuario.jovem,
        criado_em=datetime.utcnow(),
        atualizado_em=datetime.utcnow()
    )
    await user.insert()

    # Cria o Jovem mapeando os dados novos
    jovem = Jovem(
        user_id=str(user.id),
        nome=dados.nome,
        sobrenome=dados.sobrenome,
        cep=dados.bairro, # Salvando o bairro no campo cep provisoriamente
        foto_perfil=dados.foto_perfil,
        formacoes=dados.formacoes,
        criado_em=datetime.utcnow(),
        atualizado_em=datetime.utcnow()
    )
    await jovem.insert()

    user.perfil_id = str(jovem.id)
    await user.save()

    return {"message": "Jovem cadastrado com sucesso", "user_id": str(user.id), "jovem_id": str(jovem.id)}

async def login(email: str, senha: str) -> dict:
    user = await User.find_one(User.email == email)
    if not user:
        raise ValueError("Email ou senha inválidos")

    if not bcrypt.checkpw(senha.encode("utf-8"), user.senha_hash.encode("utf-8")):
        raise ValueError("Email ou senha inválidos")

    return {
        "message": "Login realizado com sucesso",
        "user_id": str(user.id),
        "jovem_id": user.perfil_id,
        "tipo": user.tipo,
    }