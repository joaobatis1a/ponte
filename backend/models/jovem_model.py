from beanie import Document
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


# --- Enums ---

class Carreira(str, Enum):
    tecnologia = "tecnologia"
    direito = "direito"
    saude = "saude"
    educacao = "educacao"
    negocios = "negocios"
    comunicacao = "comunicacao"
    engenharia = "engenharia"
    outro = "outro"


class AreaCarreira(str, Enum):
    backend = "backend"
    frontend = "frontend"
    mobile = "mobile"
    dados = "dados"
    ux_design = "ux_design"
    devops = "devops"
    seguranca = "seguranca"
    outro = "outro"


class NivelEnum(str, Enum):
    iniciante = "iniciante"          # 0 - 499 XP
    explorador = "explorador"        # 500 - 1499 XP
    desenvolvedor = "desenvolvedor"  # 1500 - 3499 XP
    especialista = "especialista"    # 3500+ XP


# --- Sub-documentos ---

class Formacao(BaseModel):
    instituicao: Optional[str] = None
    cidade: Optional[str] = None
    curso: Optional[str] = None
    inicio: Optional[date] = None
    fim: Optional[date] = None


class Habilidade(BaseModel):
    nome: str
    origem: str = "manguelito"


class Emblema(BaseModel):
    nome: str
    descricao: Optional[str] = None
    conquistado_em: datetime = datetime.utcnow()


# --- Documento principal ---

class Jovem(Document):
    # Referência ao User (autenticação)
    user_id: str

    # Dados pessoais (Figma - Passo 1)
    nome: str
    sobrenome: str
    foto_perfil: Optional[str] = None
    data_nascimento: Optional[date] = None
    cep: Optional[str] = None

    # Formações (Figma - Passo 3)
    formacoes: List[Formacao] = []

    # Carreira (HU03)
    carreira: Optional[Carreira] = None
    area_carreira: Optional[AreaCarreira] = None

    # Gamificação (HU04)
    xp: int = 0
    nivel: NivelEnum = NivelEnum.iniciante
    emblemas: List[Emblema] = []

    # Habilidades via Manguelito (HU02)
    habilidades: List[Habilidade] = []

    # Manguelito chat (HU02)
    mensagens_semana: int = 0
    ultima_resetagem_mensagens: Optional[datetime] = None

    # Controle
    ativo: bool = True
    criado_em: datetime = datetime.utcnow()
    atualizado_em: datetime = datetime.utcnow()

    class Settings:
        name = "jovens"