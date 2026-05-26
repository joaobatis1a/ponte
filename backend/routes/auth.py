from fastapi import APIRouter, HTTPException
from backend.services.auth_service import cadastrar_jovem, login, CadastroJovemSchema
from pydantic import BaseModel

router = APIRouter()


class LoginSchema(BaseModel):
    email: str
    senha: str


@router.post("/cadastro/jovem")
async def cadastro_jovem(dados: CadastroJovemSchema):
    print(f"\n[Auth-Debug] Recebendo requisição de cadastro para: {dados.email}")
    try:
        resultado = await cadastrar_jovem(dados)
        print(f"[Auth-Debug] Cadastro concluído no banco. UserID: {resultado['user_id']}")
        return resultado
    except ValueError as e:
        print(f"[Auth-Debug] Erro no cadastro: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login_usuario(dados: LoginSchema):
    try:
        resultado = await login(dados.email, dados.senha)
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))