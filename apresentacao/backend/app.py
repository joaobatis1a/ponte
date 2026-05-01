from fastapi import FastAPI
from sheets_route import router as sheets_router

app = FastAPI()

app.include_router(sheets_router)