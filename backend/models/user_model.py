from beanie import Document
from pydantic import EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class TipoUsuario(str, Enum):
    jovem = "jovem"
    empresa = "empresa"
    gestor = "gestor"


class User(Document):
    email: EmailStr
    senha_hash: str
    google_id: Optional[str] = None    
    tipo: TipoUsuario = TipoUsuario.jovem

    
    perfil_id: Optional[str] = None      

    ativo: bool = True
    criado_em: datetime = datetime.utcnow()
    atualizado_em: datetime = datetime.utcnow()

    class Settings:
        name = "users"