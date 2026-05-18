from fastapi import APIRouter, HTTPException
from backend.services.auth_service import cadastrar_jovem, login, CadastroJovemSchema
from pydantic import BaseModel

router = APIRouter()


class LoginSchema(BaseModel):
    email: str
    senha: str


@router.post("/cadastro/jovem")
async def cadastro_jovem(dados: CadastroJovemSchema):
    try:
        resultado = await cadastrar_jovem(dados)
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login_usuario(dados: LoginSchema):
    try:
        resultado = await login(dados.email, dados.senha)
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))