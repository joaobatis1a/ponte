from beanie import Document
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from enum import Enum




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
    iniciante = "iniciante"          
    explorador = "explorador"       
    desenvolvedor = "desenvolvedor"  
    especialista = "especialista"    




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

class Jovem(Document):
    user_id: str
    nome: str
    sobrenome: str
    foto_perfil: Optional[str] = None
    data_nascimento: Optional[date] = None
    cep: Optional[str] = None
   
    formacoes: List[Formacao] = []

    carreira: Optional[Carreira] = None
    area_carreira: Optional[AreaCarreira] = None

    xp: int = 0
    nivel: NivelEnum = NivelEnum.iniciante
    emblemas: List[Emblema] = []
    habilidades: List[Habilidade] = []
    desafios_aceitos: List[str] = [] 
    mensagens_semana: int = 0
    ultima_resetagem_mensagens: Optional[datetime] = None
    
    ativo: bool = True
    criado_em: datetime = datetime.utcnow()
    atualizado_em: datetime = datetime.utcnow()

    class Settings:
        name = "jovens"