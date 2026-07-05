(function () {
  'use strict';

  const API_FEED_URL = 'http://127.0.0.1:8000/feed/desafios';
  const jovemId = localStorage.getItem('ponte_jovem_id');

  // ---------------------------------------------------------------
  // Dados mockados — usados sempre que a API não estiver disponível
  // (ambiente de demo) ou retornar uma lista vazia.
  // ---------------------------------------------------------------
  const MOCK_DESAFIOS = [
    {
      desafio_id: 'mock-1', tipo: 'desafio', featured: true,
      empresa_id: 'solvex_solutions',
      titulo: 'Redesign do app de delivery local',
      descricao_curta: 'Repense a experiência de pedido de um app de delivery de bairro, do cardápio ao checkout, pensando em quem tem pouca familiaridade com apps.',
      categoria: 'UX/UI Design', dificuldade: 'Médio',
      prazo: '18 de julho', recompensa: { xp: 450 },
      requisitos: ['Figma', 'UX Research']
    },
    {
      desafio_id: 'mock-2', tipo: 'desafio',
      empresa_id: 'recibyte_tech',
      titulo: 'Landing page para lançamento de produto',
      descricao_curta: 'Monte uma landing page responsiva para o lançamento de um novo produto de tecnologia, com foco em conversão.',
      categoria: 'Front-end', dificuldade: 'Fácil',
      prazo: '25 de julho', recompensa: { xp: 280 },
      requisitos: ['HTML', 'CSS', 'JavaScript']
    },
    {
      desafio_id: 'mock-3', tipo: 'desafio',
      empresa_id: 'nordeste_labs',
      titulo: 'Automatizar planilha de controle de estoque',
      descricao_curta: 'Crie uma automação simples para reduzir o trabalho manual de atualização de estoque de um pequeno comércio.',
      categoria: 'Suporte Técnico', dificuldade: 'Fácil',
      prazo: '12 de julho', recompensa: { xp: 220 },
      requisitos: ['Excel', 'Automação']
    },
    {
      desafio_id: 'mock-4', tipo: 'desafio',
      empresa_id: 'bytemakers',
      titulo: 'API de recomendação de conteúdo',
      descricao_curta: 'Desenvolva uma API simples que recomenda conteúdos com base no histórico de interações do usuário.',
      categoria: 'Back-end', dificuldade: 'Difícil',
      prazo: '02 de agosto', recompensa: { xp: 600 },
      requisitos: ['Node.js', 'API REST']
    },
    {
      desafio_id: 'mock-5', tipo: 'desafio',
      empresa_id: 'vitrine_pe',
      titulo: 'Identidade visual pra loja de artesanato',
      descricao_curta: 'Crie uma identidade visual simples (logo + paleta) para uma loja de artesanato local que está migrando pro digital.',
      categoria: 'Design Gráfico', dificuldade: 'Médio',
      prazo: '30 de julho', recompensa: { xp: 380 },
      requisitos: ['Illustrator', 'Branding']
    },
    {
      desafio_id: 'mock-curso-1', tipo: 'curso',
      empresa_id: 'ponte_academy',
      titulo: 'Fundamentos de UX Research',
      descricao_curta: 'Curso introdutório sobre como conduzir entrevistas, testes de usabilidade e sintetizar aprendizados.',
      categoria: 'UX Research', dificuldade: 'Fácil',
      prazo: 'Acesso imediato', recompensa: { xp: 150 },
      requisitos: ['Sem pré-requisitos']
    },
    {
      desafio_id: 'mock-curso-2', tipo: 'curso',
      empresa_id: 'ponte_academy',
      titulo: 'Suporte técnico na prática',
      descricao_curta: 'Aprenda a diagnosticar e resolver os problemas mais comuns de redes e hardware do dia a dia.',
      categoria: 'Suporte Técnico', dificuldade: 'Fácil',
      prazo: 'Acesso imediato', recompensa: { xp: 150 },
      requisitos: ['Sem pré-requisitos']
    },
    {
      desafio_id: 'mock-evento-1', tipo: 'evento',
      empresa_id: 'hackathon_nordeste',
      titulo: 'Hackathon Nordeste 2026',
      descricao_curta: '48 horas de maratona de projetos com mentoria de empresas parceiras e premiação em XP e prêmios reais.',
      categoria: 'Evento', dificuldade: 'Médio',
      prazo: '20 e 21 de julho', recompensa: { xp: 800 },
      requisitos: ['Trabalho em equipe']
    }
  ];

  // 1. Busca os dados reais do perfil
  async function loadUserProfile() {
    if (!jovemId) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/profile/${jovemId}`);
      if (!res.ok) throw new Error('Perfil indisponível');

      const data = await res.json();

      const txtNome = document.getElementById('sidebar-nome');
      const txtNivel = document.getElementById('sidebar-nivel');
      const txtXp = document.getElementById('sidebar-xp');

      if (txtNome) txtNome.textContent = `${data.nome} ${data.sobrenome}`;
      if (txtNivel) txtNivel.textContent = `Lvl. ${data.nivel || 'Iniciante'}`;
      if (txtXp) txtXp.textContent = `${data.xp || 0} XP`;

    } catch (error) {
      console.warn('[Feed-Debug] Não foi possível carregar dados do usuário. Mantendo interface padrão.', error);
    }
  }

  // 2. Busca os desafios reais; usa mock como fallback de demo
  async function loadFeed() {
    const container = document.getElementById('cards-grid');
    if (!container) {
      console.error("[Feed-Debug] A div 'cards-grid' não foi encontrada no HTML!");
      return;
    }

    let desafiosArray = [];
    try {
      const response = await fetch(API_FEED_URL);
      if (!response.ok) throw new Error('Erro na API de Feed');
      const rawData = await response.json();
      desafiosArray = rawData.desafios || [];
    } catch (error) {
      console.warn('[Feed-Debug] API indisponível, usando dados de demonstração.', error);
    }

    if (desafiosArray.length === 0) desafiosArray = MOCK_DESAFIOS;

    container.innerHTML = '';
    desafiosArray.forEach(item => {
      container.innerHTML += renderCard(item);
    });
  }

  // 3. Monta o HTML do card, usando as classes já estilizadas em feed.css
  function renderCard(item) {
    const id = item.desafio_id;
    const tags = [item.categoria, item.dificuldade].filter(Boolean);
    const tagsHtml = tags.map(t => `<span class="tag">${t}</span>`).join('');
    const prazo = item.prazo || 'Sem prazo';
    const xp = item.recompensa?.xp ? `+${item.recompensa.xp} XP` : '+0 XP';
    const empresaLabel = item.empresa_id ? item.empresa_id.replace(/_/g, ' ') : 'Empresa Confidencial';
    const empresaInitials = item.empresa_id ? item.empresa_id.replace('empresa_', '').substring(0, 2).toUpperCase() : 'SS';

    let actionText = 'Participar ›';
    if (item.tipo === 'curso') actionText = 'Matricular ›';
    if (item.tipo === 'evento') actionText = 'Inscrever-se ›';

    const featuredClass = item.featured ? ' featured' : '';

    return `
      <div class="card ${item.tipo}${featuredClass}" data-type="${item.tipo}">
        <span class="type-ribbon">${item.tipo}</span>
        <div class="card-header">
          <div class="company-row">
            <div class="company-logo">${empresaInitials}</div>
            <div>
              <div class="company-name" style="text-transform: capitalize;">${empresaLabel}</div>
              <div class="company-location">Pernambuco</div>
            </div>
          </div>
          <div class="card-meta">
            <div class="meta-date">📅 ${prazo}</div>
            <div class="meta-xp">✨ ${xp}</div>
          </div>
        </div>

        <div class="card-tags">${tagsHtml}</div>
        <div class="card-title">${item.titulo}</div>
        <div class="card-desc">${item.descricao_curta || item.descricao || ''}</div>

        <div class="card-footer">
          <div class="participants">
            <span class="part-count">Novidade!</span>
          </div>
          <div class="card-actions">
            <button class="go-btn" onclick="window.location.href='desafio.html?id=${id}'">${actionText}</button>
          </div>
        </div>
      </div>
    `;
  }

  // 4. Lógica de botões de filtro
  function setupFilters() {
    const filterBtns = document.querySelectorAll('.pill');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
          const show = filterValue === 'all' || card.getAttribute('data-type') === filterValue;
          card.classList.toggle('hidden', !show);
        });
      });
    });
  }

  // 5. Start
  document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadFeed().then(() => {
      setupFilters();
    });
  });

})();
