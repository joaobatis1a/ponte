from backend.models.user_model import User, TipoUsuario
from backend.models.jovem_model import Jovem
from pydantic import BaseModel, EmailStr
from datetime import datetime
import bcrypt




class CadastroJovemSchema(BaseModel):
    nome: str
    sobrenome: str
    email: EmailStr
    senha: str
    data_nascimento: str = None
    cep: str = None




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

    # Cria o Jovem (perfil)
    jovem = Jovem(
        user_id=str(user.id),
        nome=dados.nome,
        sobrenome=dados.sobrenome,
        data_nascimento=dados.data_nascimento,
        cep=dados.cep,
        criado_em=datetime.utcnow(),
        atualizado_em=datetime.utcnow()
    )
    await jovem.insert()

  
    user.perfil_id = str(jovem.id)
    await user.save()

    return {"message": "Jovem cadastrado com sucesso", "user_id": str(user.id), "jovem_id": str(jovem.id)}


async def login(email: str, senha: str) -> dict:
    # Busca o usuário
    user = await User.find_one(User.email == email)
    if not user:
        raise ValueError("Email ou senha inválidos")

  
    if not bcrypt.checkpw(senha.encode("utf-8"), user.senha_hash.encode("utf-8")):
        raise ValueError("Email ou senha inválidos")

    return {"message": "Login realizado com sucesso", "user_id": str(user.id), "tipo": user.tipo}