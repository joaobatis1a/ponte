from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from sheets_service import append_dados, listar_dados

router = APIRouter(prefix="/sheets", tags=["Google Sheets"])


class FormularioData(BaseModel):
    Nome: str
    Sobrenome: str
    Idade: int
    Bairro: str
    Experiencias_Informais: Optional[str] = ""
    Instituicao: Optional[str] = ""
    Cidade_Curso: Optional[str] = ""
    Tipo_Curso: Optional[str] = ""
    Data_Inicio: Optional[str] = ""
    Data_Fim: Optional[str] = ""
    Contato_WhatsApp_Email: str


@router.post("/inserir")
def inserir_dados(formulario: FormularioData):
    resultado = append_dados(formulario.dict())
    return resultado


@router.get("/listar")
def listar():
    return listar_dados()