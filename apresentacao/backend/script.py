import gspread
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials

filename = "apresentation/backend/ponte-495019-7bf3fa0a646d.json"

scopes = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/drive",
]

creds = ServiceAccountCredentials.from_json_keyfile_name(
    filename=filename,
    scopes=scopes
)

client = gspread.authorize(creds)

planilha_completa = client.open(
    title="ponte-mvp",
    folder_id="1dLiWw1TAIP_Y9YMCfauPeypSPIFqpyj5",
)

planilha = planilha_completa.get_worksheet(0)
dados = planilha.get_all_records()


df = pd.DataFrame(dados)
print(df.to_string(index=False))