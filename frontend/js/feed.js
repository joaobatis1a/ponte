(function () {
  'use strict';

  const API_FEED_URL = 'http://127.0.0.1:8000/feed/desafios';
  const jovemId = localStorage.getItem('ponte_jovem_id');

  // 1. Busca os dados reais do perfil
  async function loadUserProfile() {
    if (!jovemId) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/profile/${jovemId}`);
      if (!res.ok) throw new Error('Perfil indisponível');
      
      const data = await res.json();
      
      // Mapeamento exato com o seu feed.html
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

  // 2. Busca e renderiza os desafios do MongoDB
  async function loadFeed() {
    try {
      const response = await fetch(API_FEED_URL);
      if (!response.ok) throw new Error('Erro na API de Feed');
      
      const rawData = await response.json();
      const desafiosArray = rawData.desafios || [];

      // CORREÇÃO: Buscando pelo ID correto do HTML (cards-grid)
      const container = document.getElementById('cards-grid');
      
      if (!container) {
          console.error("[Feed-Debug] A div 'cards-grid' não foi encontrada no HTML!");
          return;
      }

      container.innerHTML = ''; // Limpa a tela
      
      if (desafiosArray.length === 0) {
          container.innerHTML = '<p style="text-align:center; padding: 20px; color: #666;">Nenhum desafio encontrado no banco de dados.</p>';
          return;
      }

      desafiosArray.forEach(item => {
        container.innerHTML += renderCard(item);
      });

    } catch (error) {
      console.error('[Feed-Debug] O feed quebrou ao consumir a API:', error);
    }
  }

  // 3. Monta o HTML do Card
  function renderCard(item) {
    const id = item.desafio_id; 
    const tagsHtml = (item.requisitos || []).map(req => `<span class="tag">${req.nome || req}</span>`).join('');
    const prazo = item.prazo || 'Sem prazo';
    const xp = item.recompensa?.xp ? `+${item.recompensa.xp} XP` : '+0 XP';
    const empresa = item.empresa_id ? item.empresa_id.replace('empresa_', '').toUpperCase() : 'SS';
    
    let actionText = 'Participar ›';
    let btnClass = 'go-btn';
    if (item.tipo === 'curso') { actionText = 'Matricular ›'; btnClass = 'go-btn go-curso'; }
    if (item.tipo === 'evento') { actionText = 'Inscrever-se ›'; btnClass = 'go-btn go-evento'; }

    return `
      <div class="card ${item.tipo}" data-type="${item.tipo}">
        <div class="card-header">
          <div class="company-row">
            <div class="company-logo" style="color: #fff; background: var(--orange); font-size: 11px;">${empresa.substring(0,2)}</div>
            <div>
              <div class="company-name" style="text-transform: capitalize;">${item.empresa_id ? item.empresa_id.replace(/_/g, ' ') : 'Empresa Confidencial'}</div>
              <div class="company-location">Pernambuco</div>
            </div>
          </div>
          <div class="card-meta" style="display: flex; gap: 10px; margin-top: 15px; font-size: 13px;">
            <div class="meta-type" style="text-transform: capitalize; font-weight: 800; color: var(--orange);">🏷️ ${item.tipo}</div>
            <div class="meta-date" style="color: #666;">📅 ${prazo}</div>
            <div class="meta-xp" style="color: #2e7d32; font-weight: bold;">✨ ${xp}</div>
          </div>
        </div>
        
        <div class="card-tags" style="margin-top: 10px;">${tagsHtml}</div>
        <div class="card-title" style="margin-top: 10px; font-size: 18px;">${item.titulo}</div>
        <div class="card-desc" style="margin-top: 5px; color: #555;">${item.descricao_curta || item.descricao}</div>
        
        <div class="card-footer" style="margin-top: 15px;">
          <div class="participants">
            <span class="part-count">Novidade!</span>
          </div>
          <div class="card-actions">
            <button class="${btnClass}" onclick="window.location.href='desafio.html?id=${id}'">${actionText}</button>
          </div>
        </div>
      </div>
    `;
  }

  // 4. Lógica de botões de filtro
  function setupFilters() {
    // CORREÇÃO: Buscando pela classe '.pill' do HTML
    const filterBtns = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');
        cards.forEach(card => {
          if (filterValue === 'all' || card.getAttribute('data-type') === filterValue) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
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