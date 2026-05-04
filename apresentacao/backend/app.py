import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sheets import router as sheets_router

logging.basicConfig(level=logging.DEBUG, format='[BACKEND] %(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger('ponte')

app = FastAPI()

# Adicionar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, restringir para domínios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event('startup')
def startup_event():
    logger.debug('Aplicação FastAPI iniciada e CORS configurado.')

app.include_router(sheets_router)