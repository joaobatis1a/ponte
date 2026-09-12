# P.O.N.T.E.

**Plataforma de oportunidades para jovens talentos** · FastAPI · MongoDB

[![Demo](https://img.shields.io/badge/demo-online-F97316?style=flat-square)](https://ponte-demo.vercel.app)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)

> **Projeto acadêmico desenvolvido em equipe (5 pessoas), 1º lugar como melhor proposta de software na UNIFAFIRE.**
> Minha atuação: Front-end Lead & Scrum Master.
> Repositório original da equipe: [guifigueireedo/ponte-mvp](https://github.com/guifigueireedo/ponte-mvp)

Conecta jovens a desafios profissionais reais, ajudando a transformar experiências do dia a dia em habilidades reconhecidas, com apoio do "Manguelito", um assistente de IA que extrai skills a partir de conversas.

🔗 **Demo (somente frontend):** [ponte-demo.vercel.app](https://ponte-demo.vercel.app)

## 🧱 Estrutura do projeto

```
ponte-main/
├── backend/     → API em Python + FastAPI + MongoDB (Beanie/Motor)
└── frontend/    → Interface web em HTML, CSS e JavaScript puro
```

## 🛠️ Tecnologias usadas

**Backend**
- 🐍 Python 3
- ⚡ FastAPI + Uvicorn
- 🍃 MongoDB (via Motor + Beanie ODM)
- 🔐 bcrypt (hash de senha)
- 🤖 Groq API (chat com IA, modelo `llama-3.1-8b-instant` por padrão)

**Frontend**
- 🌐 HTML5
- 🎨 CSS3
- ⚡ JavaScript (puro, sem framework)

## 📡 Endpoints da API

| Recurso | Método | Rota |
|---|---|---|
| Auth | POST | `/auth/cadastro/jovem` |
| Auth | POST | `/auth/login` |
| Chat (Manguelito) | POST | `/chat/mensagem` |
| Feed | GET | `/feed/desafios` |
| Feed | GET | `/feed/desafios/{desafio_id}` |
| Feed | POST | `/feed/submissao` |
| Feed | DELETE | `/feed/submissao/{submissao_id}` |
| Feed | POST | `/feed/desafios/{desafio_id}/aceitar` |
| Feed | GET | `/feed/desafios/{desafio_id}/status` |
| Perfil | GET | `/profile/{jovem_id}` |
| Perfil | POST | `/profile/{jovem_id}/skills` |

## 🚀 Como rodar o projeto localmente

### Pré-requisitos
- Python 3.10+
- Uma instância do MongoDB (local ou Atlas)
- Uma chave de API da [Groq](https://console.groq.com) (grátis)

### 1. Configurar o ambiente

Crie um arquivo `.env` **na raiz do projeto** (mesma pasta onde estão `frontend/` e `backend/`):

```bash
MONGODB_URL=mongodb+srv://SEU_USUARIO:SUA_SENHA@SEU_CLUSTER.mongodb.net/
DATABASE_NAME=ponte-mvp
GROQ_API_KEY=sua_chave_da_groq
GROQ_MODEL=llama-3.1-8b-instant
```

⚠️ Sem `MONGODB_URL` preenchida, o backend não sobe (o `app.py` lança um erro de propósito).

⚠️ **Importante:** nunca deixe esse `.env` versionado no Git com credenciais reais (já está no `.gitignore`).

### 2. Rodar o backend

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn backend.app:app --reload
```

O servidor sobe em `http://localhost:8000`. Documentação automática (Swagger) em `http://localhost:8000/docs`.

### 3. Rodar o frontend

O frontend é HTML/CSS/JS puro, não precisa de build. Basta servir a pasta `frontend/`:

```bash
cd frontend
python3 -m http.server 5500
```

Depois acesse `http://localhost:5500`.

⚠️ **Atenção:** hoje as páginas do frontend (`index.html`, `login.html`, `cadastro.html`, `feed.html`, `chat.html`, etc.) ainda **não fazem chamadas `fetch` para a API**. É uma interface navegável, mas as ações (login, cadastro, chat, feed) ainda não estão conectadas ao backend.

## 🌐 Deploy no Vercel (somente frontend)

Como o frontend é 100% estático, dá pra publicar uma demo visual rapidinho:

1. Suba este repositório para o GitHub.
2. No Vercel, importe o repositório normalmente.
3. Em **Framework Preset**, deixe **Other**.
4. Em **Root Directory**, selecione a pasta `frontend`.
5. Não defina Build Command nem Output Directory, deixe em branco.
6. Deploy.

**O que funciona:** navegação entre as páginas, layout, estilos e responsividade.
**O que NÃO funciona:** login, cadastro, chat e feed (dependem da API, que ainda não está conectada nem publicada).

## 🔧 Para uma demo 100% funcional (com backend)

Seria necessário:

1. Hospedar o backend FastAPI em um serviço compatível com processos "always on" (Render, Railway, Fly.io; o Vercel não é ideal aqui, por causa da conexão persistente com o MongoDB na inicialização).
2. Hospedar o banco MongoDB (ex: MongoDB Atlas, tem plano grátis).
3. Configurar `MONGODB_URL` e `GROQ_API_KEY` como variáveis de ambiente no serviço escolhido.
4. Implementar as chamadas `fetch` no frontend, apontando para a URL pública do backend.

## 🔒 Segurança

Nunca exponha credenciais de banco de dados, chaves de API ou tokens em arquivos versionados no Git. Use sempre um `.env` (já ignorado pelo Git neste projeto).

## Autor

**João Batista da Silva Neto**
Front-end Lead & Scrum Master

- GitHub: [@joaobatis1a](https://github.com/joaobatis1a)
- LinkedIn: [joao-batista-silva-neto](https://linkedin.com/in/joao-batista-silva-neto)
- E-mail: [profissionalba1is1a@gmail.com](mailto:profissionalba1is1a@gmail.com)
