import gspread
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime
import os

FILENAME = os.getenv("GOOGLE_CREDENTIALS_PATH", "ponte-495019-7bf3fa0a646d.json")

SCOPES = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/drive",
]

SPREADSHEET_TITLE = "ponte-mvp"
SPREADSHEET_FOLDER_ID = "1dLiWw1TAIP_Y9YMCfauPeypSPIFqpyj5"

HEADERS = [
    "Timestamp", "Nome", "Sobrenome", "Idade", "Bairro",
    "Experiencias_Informais", "Instituicao", "Cidade_Curso",
    "Tipo_Curso", "Data_Inicio", "Data_Fim", "Contato_WhatsApp_Email"
]


def get_sheet():
    creds = ServiceAccountCredentials.from_json_keyfile_name(
        filename=FILENAME,
        scopes=SCOPES
    )
    client = gspread.authorize(creds)
    planilha_completa = client.open(
        title=SPREADSHEET_TITLE,
        folder_id=SPREADSHEET_FOLDER_ID,
    )
    return planilha_completa.get_worksheet(0)


def garantir_cabecalhos(sheet):
    primeira_linha = sheet.row_values(1)
    if primeira_linha != HEADERS:
        sheet.insert_row(HEADERS, index=1)


def append_dados(dados: dict) -> dict:
    try:
        sheet = get_sheet()
        garantir_cabecalhos(sheet)

        linha = [
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            dados.get("Nome", ""),
            dados.get("Sobrenome", ""),
            dados.get("Idade", ""),
            dados.get("Bairro", ""),
            dados.get("Experiencias_Informais", ""),
            dados.get("Instituicao", ""),
            dados.get("Cidade_Curso", ""),
            dados.get("Tipo_Curso", ""),
            dados.get("Data_Inicio", ""),
            dados.get("Data_Fim", ""),
            dados.get("Contato_WhatsApp_Email", ""),
        ]

        sheet.append_row(linha)
        return {"status": "sucesso", "mensagem": "Dados inseridos com sucesso!"}

    except gspread.exceptions.APIError as e:
        return {"status": "erro", "mensagem": f"Erro na API do Google Sheets: {str(e)}"}

    except ConnectionError:
        return {"status": "erro", "mensagem": "Sem conexão com a internet. Tente novamente."}

    except Exception as e:
        return {"status": "erro", "mensagem": f"Erro inesperado: {str(e)}"}


def listar_dados() -> dict:
    try:
        sheet = get_sheet()
        dados = sheet.get_all_records()

        df = pd.DataFrame(dados)
        print(df.to_string(index=False))

        return {"status": "sucesso", "dados": dados}

    except Exception as e:
        return {"status": "erro", "mensagem": f"Erro ao buscar dados: {str(e)}"}