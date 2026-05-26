(() => {
  'use strict';

  // URL da API do Pedro (ajuste a porta conforme o servidor de vocês)
  const API_FEED_URL = 'http://127.0.0.1:8000/feed';
  const grid = document.getElementById('cards-grid');

  // Dados de fallback caso o backend do Pedro esteja fora do ar
  const fallbackData = [
    {
      tipo: 'desafio', empresa: 'Solvex Solutions', logo: 'SS', cor_logo: '#f5a670', local: 'Olinda · PE',
      data: '20 JUN', xp: '+550 XP', tags: ['UX', 'LVL. 1-2'],
      titulo: 'UX Design: E-commerce de Artesanato em Recife',
      desc: 'Um e-commerce de artesanato em Recife aguarda um fluxo de checkout que transforma a história do artesão em motivo de compra.',
      participantes: '+20 Participando'
    },
    {
      tipo: 'curso', empresa: 'DesignLab Nordeste', logo: 'UX', cor_logo: '#2a7d4f', local: 'Remoto',
      data: '8 semanas', xp: '+400 XP', tags: ['UX RESEARCH', 'LVL. 1-3'],
      titulo: 'UX Research na Prática: do Zero ao Insight',
      desc: 'Aprenda a conduzir entrevistas, criar personas e validar hipóteses de produto com usuários reais do Nordeste.',
      participantes: '65% preenchido'
    },
    {
      tipo: 'evento', empresa: 'Porto Digital', logo: 'HKT', cor_logo: '#c45e20', local: 'Recife · PE',
      data: '05 ABR', xp: '+1.000 XP', tags: ['HACKATHON', 'PRESENCIAL'],
      titulo: 'Hackathon Nordeste 2025: Inovação em Logística',
      desc: '48h de desafio presencial no Porto Digital. Resolva problemas reais de logística costeira com equipes multidisciplinares.',
      participantes: '+120 Inscritos'
    }
  ];

  // Função para montar o HTML de cada card
  function renderCard(item) {
    const tagsHtml = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    // Pequena variação visual dependendo do tipo
   let actionBtn = `<button class="go-btn" onclick="window.location.href='/ponte-mvp/frontend/desafio.html'">Participar ›</button>`;
  if (item.tipo === 'curso') actionBtn = `<button class="go-btn go-curso" onclick="window.location.href='/ponte-mvp/frontend/desafio.html'">Matricular ›</button>`;
  if (item.tipo === 'evento') actionBtn = `<button class="go-btn go-evento" onclick="window.location.href='/ponte-mvp/frontend/desafio.html'">Inscrever-se ›</button>`;

    return `
      <div class="card ${item.tipo}" data-type="${item.tipo}">
        <div class="type-ribbon">${item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}</div>
        <div class="card-header">
          <div class="company-row">
            <div class="company-logo" style="color:${item.cor_logo || '#fff'}; font-size: 10px;">${item.logo}</div>
            <div>
              <div class="company-name">${item.empresa}</div>
              <div class="company-location">${item.local}</div>
            </div>
          </div>
          <div class="card-meta">
            <div class="meta-date">📅 ${item.data}</div>
            <div class="meta-xp">${item.xp}</div>
          </div>
        </div>
        <div class="card-tags">${tagsHtml}</div>
        <div class="card-title">${item.titulo}</div>
        <div class="card-desc">${item.desc}</div>
        <div class="card-footer">
          <div class="participants">
            <span class="part-count">${item.participantes}</span>
          </div>
          <div class="card-actions">
            <button class="act-btn" onclick="this.classList.toggle('liked')">♥</button>
            <button class="act-btn share-btn">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
            ${actionBtn}
          </div>
        </div>
      </div>
    `;
  }

  // Busca os dados da API
  async function loadFeed() {
    try {
      grid.innerHTML = '<p style="text-align: center; width: 100%; color: var(--muted);">Buscando oportunidades...</p>';
      
      const response = await fetch(API_FEED_URL);
      if (!response.ok) throw new Error('Backend indisponível');
      
      const data = await response.json();
      console.log("\n[Feed-Debug] Dados brutos recebidos da API:", data);
      
      // Se vier vazio, exibe mensagem
      if (!data || data.length === 0) {
        grid.innerHTML = '<p style="text-align: center; width: 100%; color: var(--muted);">Nenhuma oportunidade no momento. Volta mais tarde!</p>';
        return;
      }

      grid.innerHTML = data.map(renderCard).join('');

    } catch (error) {
      console.warn('[Feed] Backend não respondeu. Usando dados de fallback.', error);
      // Fallback pra tela não ficar em branco enquanto Pedro arruma a API
      grid.innerHTML = fallbackData.map(renderCard).join('');
    }
  }

  // Sistema de Filtros (Pills)
  function setupFilters() {
    const pills = document.querySelectorAll('.pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        // Remove active de todos e bota no clicado
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.dataset.filter;
        const cards = grid.querySelectorAll('.card');

        cards.forEach(card => {
          if (filter === 'all' || card.dataset.type === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Inicia o bagulho
  document.addEventListener('DOMContentLoaded', () => {
    loadFeed().then(() => {
      setupFilters();
    });
  });

})();