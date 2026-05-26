from backend.models.task_model import Desafio, StatusDesafio, NivelDesafio, Requisito, Recompensa
from datetime import datetime, timedelta

async def popular_desafios_mock():
    quantidade = await Desafio.find_all().count()
    if quantidade > 0:
        print("[Seed] Banco já possui desafios. Pulando injeção de mock.")
        return

    print("[Seed] Injetando 3 desafios mockados no banco MongoDB...")

    desafio1 = Desafio(
        empresa_id="empresa_solvex_001",
        titulo="UX Design: E-commerce de Artesanato em Recife",
        descricao="Um e-commerce de artesanato em Recife aguarda um fluxo de checkout que transforma a história do artesão em motivo de compra.",
        tipo="desafio",
        status=StatusDesafio.ativo,
        area_carreira="ux_design",
        requisitos=[Requisito(nome="Figma"), Requisito(nome="Prototipagem")],
        recompensa=Recompensa(xp=550),
        nivel=NivelDesafio.iniciante,
        dica_manguelito="Foca em deixar o botão de compra bem visível, visse?",
        prazo=datetime.utcnow().date() + timedelta(days=30)
    )

    desafio2 = Desafio(
        empresa_id="empresa_designlab_002",
        titulo="UX Research na Prática: do Zero ao Insight",
        descricao="Aprenda a conduzir entrevistas, criar personas e validar hipóteses de produto com usuários reais do Nordeste.",
        tipo="curso",
        status=StatusDesafio.ativo,
        area_carreira="ux_design",
        requisitos=[Requisito(nome="Empatia"), Requisito(nome="Pesquisa Qualitativa")],
        recompensa=Recompensa(xp=400),
        nivel=NivelDesafio.intermediario,
        dica_manguelito="Anota tudo que o usuário falar, até os suspiros!",
        prazo=datetime.utcnow().date() + timedelta(days=60)
    )

    desafio3 = Desafio(
        empresa_id="empresa_porto_003",
        titulo="Hackathon Nordeste 2025: Inovação em Logística",
        descricao="48h de desafio presencial no Porto Digital. Resolva problemas reais de logística costeira com equipes multidisciplinares.",
        tipo="evento",
        status=StatusDesafio.ativo,
        area_carreira="backend",
        requisitos=[Requisito(nome="Lógica de Programação"), Requisito(nome="Trabalho em Equipe")],
        recompensa=Recompensa(xp=1000),
        nivel=NivelDesafio.avancado,
        dica_manguelito="Leva café e energético, porque a noite vai ser longa!",
        prazo=datetime.utcnow().date() + timedelta(days=15)
    )

    await Desafio.insert_many([desafio1, desafio2, desafio3])
    print("[Seed] 3 oportunidades inseridas com sucesso!")