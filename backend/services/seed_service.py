from backend.models.task_model import Desafio, StatusDesafio, NivelDesafio, Requisito, Recompensa, Entregavel, Empresa
from datetime import datetime, timedelta

async def popular_desafios_mock():
    # Em desenvolvimento, deletar desafios antigos para recriar com novos campos
    desafios_existentes = await Desafio.find_all().to_list()
    if desafios_existentes:
        await Desafio.delete_all()
        print("[Seed] Desafios antigos removidos para atualização.")

    print("[Seed] Injetando 3 desafios mockados no banco MongoDB...")

    desafio1 = Desafio(
        empresa_id="empresa_solvex_001",
        empresa_info=Empresa(
                nome="Solvex Solutions",
                initialiais="SS",
                localizacao="Olinda · PE",
                bio="Uma startup que valoriza raízes pernambucanas, elevando a criação local e o mercado de trabalho em Pernambuco.",
                url_perfil="https://solvex.example.com"
            ),
        titulo="UX Design: E-commerce de Artesanato em Recife",
        descricao=("Um mercado de artesanato em Recife precisa de uma ponte digital. Seu objetivo é projetar uma plataforma que conecta artesãos locais com o mercado internacional, mantendo a identidade cultural da região. Você deverá criar o fluxo principal de checkout, focando em como contar a história do artesão e o impacto das suas artes antes do pagamento, agregando valor emocional ao produto final."),
        descricao_curta=("Um mercado de artesanato em Recife precisa de uma ponte digital. Seu objetivo é projetar uma plataforma que conecta artesãos locais com o mercado internacional, mantendo a identidade cultural da região."),
        descricao_longa=("Um mercado de artesanato em Recife precisa de uma ponte digital. Seu objetivo é projetar uma plataforma que conecta artesãos locais com o mercado internacional, mantendo a identidade cultural da região. Você deverá criar o fluxo principal de checkout, focando em como contar a história do artesão e o impacto das suas artes antes do pagamento, agregando valor emocional ao produto final. "
                   "Para elaborar a solução espere detalhar componentes de UI, fluxos de navegação, microinterações e estratégias de storytelling que valorizem o artesão e o produto. Considere acessibilidade, responsividade e tradução cultural de conteúdo para diferentes públicos."),
        tipo="desafio",
        status=StatusDesafio.ativo,
        area_carreira="ux_design",
        requisitos=[Requisito(nome="Figma"), Requisito(nome="Storytelling"), Requisito(nome="Nível 1–2")],
        entregaveis=[
                Entregavel(descricao="Protótipo navegável (Link do Figma)", opcional=False),
                Entregavel(descricao="Estudo de caso racional do design (.pdf)", opcional=False),
                Entregavel(descricao="Vídeo de até 2 min explicando a solução (.mp4)", opcional=True),
            ],
        recompensa=Recompensa(xp=550, emblema="Designer Iniciante", rarity="No PP"),
        nivel=NivelDesafio.iniciante,
        dica_manguelito="Ei você! Novos aqui? O fluxo de checkout não é só botões, tá? Tem que ter navegação acessível pro produto final. E lembre que o avaliador vai querer ver o fluxo de razões, é claro, um visual atraente. Pague mais do seu cuidado visual!",
        total_participantes=21,
        prazo=datetime.utcnow().date() + timedelta(days=30)
    )

    desafio2 = Desafio(
        empresa_id="empresa_designlab_002",
        empresa_info=Empresa(
                nome="DesignLab",
                initialiais="DL",
                localizacao="Recife · PE",
                bio="Laboratório de design focado em pesquisa e inovação de produtos digitais.",
                url_perfil="https://designlab.example.com"
            ),
        titulo="UX Research na Prática: do Zero ao Insight",
        descricao=("Aprenda a conduzir entrevistas, criar personas e validar hipóteses de produto com usuários reais do Nordeste. Este curso prático vai te mostrar as melhores técnicas de pesquisa qualitativa e como aplicá-las em seus projetos."),
        descricao_curta=("Aprenda a conduzir entrevistas, criar personas e validar hipóteses de produto com usuários reais do Nordeste."),
        descricao_longa=("Aprenda a conduzir entrevistas, criar personas e validar hipóteses de produto com usuários reais do Nordeste. Este curso prático vai te mostrar as melhores técnicas de pesquisa qualitativa e como aplicá-las em seus projetos. Ao longo do curso você fará exercícios práticos, análises de entrevistas e exercícios de síntese para transformar dados brutos em insights acionáveis."),
        tipo="curso",
        status=StatusDesafio.ativo,
        area_carreira="ux_design",
        requisitos=[Requisito(nome="Empatia"), Requisito(nome="Pesquisa Qualitativa")],
        entregaveis=[
                Entregavel(descricao="Relatório de pesquisa com insights", opcional=False),
                Entregavel(descricao="Apresentação de personas", opcional=False),
            ],
        recompensa=Recompensa(xp=400, emblema="Pesquisador", rarity="Comum"),
        nivel=NivelDesafio.intermediario,
        dica_manguelito="Anota tudo que o usuário falar, até os suspiros!",
        total_participantes=15,
        prazo=datetime.utcnow().date() + timedelta(days=60)
    )

    desafio3 = Desafio(
        empresa_id="empresa_porto_003",
        empresa_info=Empresa(
                nome="Porto Digital",
                initialiais="PD",
                localizacao="Porto de Galinhas · PE",
                bio="Um dos maiores polos de tecnologia e inovação do Brasil, dedicado a impulsionar startups e talentos tech.",
                url_perfil="https://portodigital.example.com"
            ),
        titulo="Hackathon Nordeste 2025: Inovação em Logística",
        descricao=("48h de desafio presencial no Porto Digital. Resolva problemas reais de logística costeira com equipes multidisciplinares. Você terá acesso a mentores, recursos e uma comunidade vibrante de inovadores."),
        descricao_curta=("48h de desafio presencial no Porto Digital: resolva problemas reais de logística costeira com equipes multidisciplinares."),
        descricao_longa=("48h de desafio presencial no Porto Digital. Resolva problemas reais de logística costeira com equipes multidisciplinares. Você terá acesso a mentores, recursos e uma comunidade vibrante de inovadores. Durante o evento serão oferecidas sessões de mentoria, checkpoints técnicos e apoio para prototipagem rápida, além de premiações para as soluções mais promissoras."),
        tipo="evento",
        status=StatusDesafio.ativo,
        area_carreira="backend",
        requisitos=[Requisito(nome="Lógica de Programação"), Requisito(nome="Trabalho em Equipe"), Requisito(nome="Criatividade")],
        entregaveis=[
                Entregavel(descricao="Protótipo funcional da solução", opcional=False),
                Entregavel(descricao="Pitch de 5 minutos para apresentar", opcional=False),
                Entregavel(descricao="Código no GitHub", opcional=True),
            ],
        recompensa=Recompensa(xp=1000, emblema="Inovador 2025", rarity="Raro"),
        nivel=NivelDesafio.avancado,
        dica_manguelito="Leva café e energético, porque a noite vai ser longa!",
        total_participantes=45,
        prazo=datetime.utcnow().date() + timedelta(days=15)
    )

    await Desafio.insert_many([desafio1, desafio2, desafio3])
    print("[Seed] 3 oportunidades inseridas com sucesso!")