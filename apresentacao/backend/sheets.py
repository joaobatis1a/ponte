import logging

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import gspread
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime
import os

logger = logging.getLogger('ponte.sheets')
router = APIRouter(prefix="/sheets", tags=["Google Sheets"])

FILENAME = os.getenv("GOOGLE_CREDENTIALS_PATH", "ponte-495019-7bf3fa0a646d.json")
SCOPES = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
SPREADSHEET_TITLE = "ponte-mvp"
SPREADSHEET_FOLDER_ID = "1dLiWw1TAIP_Y9YMCfauPeypSPIFqpyj5"
HEADERS = ["Timestamp", "Nome", "Sobrenome", "Idade", "Bairro", "Experiencias_Informais", "Instituicao", "Cidade_Curso", "Tipo_Curso", "Data_Inicio", "Data_Fim", "Contato_WhatsApp_Email"]

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

def get_sheet():
    logger.debug('Abrindo credenciais do Google Sheets usando %s', FILENAME)
    if not os.path.exists(FILENAME):
        error_msg = f'Arquivo de credenciais não encontrado: {os.path.abspath(FILENAME)}. Coloque o arquivo ponte-495019-7bf3fa0a646d.json em /apresentacao/backend/ ou configure a env var GOOGLE_CREDENTIALS_PATH'
        logger.error(error_msg)
        raise FileNotFoundError(error_msg)
    creds = ServiceAccountCredentials.from_json_keyfile_name(filename=FILENAME, scopes=SCOPES)
    client = gspread.authorize(creds)
    logger.debug('Autorização gspread concluída. Abrindo planilha %s', SPREADSHEET_TITLE)
    planilha_completa = client.open(title=SPREADSHEET_TITLE, folder_id=SPREADSHEET_FOLDER_ID)
    worksheet = planilha_completa.get_worksheet(0)
    logger.debug('Worksheet obtida: %s', worksheet.title if worksheet else 'nenhuma')
    return worksheet

def garantir_cabecalhos(sheet):
    primeira_linha = sheet.row_values(1)
    logger.debug('Cabeçalho atual da planilha: %s', primeira_linha)
    if primeira_linha != HEADERS:
        logger.debug('Cabeçalho diferente. Inserindo cabeçalho padrão.')
        sheet.insert_row(HEADERS, index=1)

@router.post("/inserir")
def inserir_dados(formulario: FormularioData):
    try:
        payload = formulario.dict()
        logger.debug('/sheets/inserir recebido payload: %s', payload)
        sheet = get_sheet()
        garantir_cabecalhos(sheet)
        linha = [
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            formulario.Nome, formulario.Sobrenome, formulario.Idade, formulario.Bairro,
            formulario.Experiencias_Informais, formulario.Instituicao, formulario.Cidade_Curso,
            formulario.Tipo_Curso, formulario.Data_Inicio, formulario.Data_Fim, formulario.Contato_WhatsApp_Email
        ]
        logger.debug('Inserindo linha no Sheets: %s', linha)
        sheet.append_row(linha)
        logger.debug('Linha inserida com sucesso.')
        return {"status": "sucesso", "mensagem": "Dados inseridos com sucesso!"}
    except Exception as e:
        logger.exception('Erro ao inserir dados no Google Sheets')
        return {"status": "erro", "mensagem": f"Erro: {str(e)}"}

@router.get("/listar")
def listar():
    try:
        logger.debug('/sheets/listar requisitado')
        sheet = get_sheet()
        dados = sheet.get_all_records()
        df = pd.DataFrame(dados)
        logger.debug('Registros retornados: %s', len(dados))
        logger.debug('\n%s', df.to_string(index=False))
        return {"status": "sucesso", "dados": dados}
    except Exception as e:
        return {"status": "erro", "mensagem": f"Erro ao buscar dados: {str(e)}"}