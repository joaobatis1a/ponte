(function () {
  'use strict';

  const MOCK_VAGAS = [
    {
      id: 'vaga-suporte-infra', empresa: 'Mangue Tech', iniciais: 'MT',
      local: 'Recife · PE', modalidade: 'hibrido', area: 'Suporte',
      titulo: 'Estágio em Suporte Técnico: Time de Infraestrutura',
      tags: ['Suporte Técnico', 'Atendimento'],
      salario: 'R$ 1.200/mês + VT', tipo: 'Estágio · CLT'
    },
    {
      id: 'vaga-frontend-jr', empresa: 'Recibyte Tech', iniciais: 'RB',
      local: 'Recife · PE', modalidade: 'remoto', area: 'Tecnologia',
      titulo: 'Desenvolvedor(a) Front-end Júnior',
      tags: ['HTML', 'CSS', 'JavaScript'],
      salario: 'R$ 2.100/mês', tipo: 'CLT'
    },
    {
      id: 'vaga-ux-estagio', empresa: 'Solvex Solutions', iniciais: 'SS',
      local: 'Olinda · PE', modalidade: 'hibrido', area: 'Design',
      titulo: 'Estágio em UX/UI Design',
      tags: ['Figma', 'UX Research'],
      salario: 'R$ 1.100/mês', tipo: 'Estágio'
    },
    {
      id: 'vaga-dados-jr', empresa: 'Bytemakers', iniciais: 'BM',
      local: 'Remoto', modalidade: 'remoto', area: 'Dados',
      titulo: 'Analista de Dados Júnior',
      tags: ['SQL', 'Excel', 'Python'],
      salario: null, tipo: 'PJ'
    },
    {
      id: 'vaga-suporte-presencial', empresa: 'Vitrine PE', iniciais: 'VP',
      local: 'Caruaru · PE', modalidade: 'presencial', area: 'Suporte',
      titulo: 'Assistente de Suporte ao Cliente',
      tags: ['Atendimento', 'Comunicação'],
      salario: 'R$ 1.412/mês', tipo: 'CLT'
    },
    {
      id: 'vaga-social-media', empresa: 'Nordeste Labs', iniciais: 'NL',
      local: 'Jaboatão · PE', modalidade: 'hibrido', area: 'Design',
      titulo: 'Assistente de Marketing e Design',
      tags: ['Canva', 'Redes Sociais'],
      salario: 'R$ 1.300/mês', tipo: 'Estágio'
    }
  ];

  const grid = document.getElementById('jobs-grid');
  const emptyState = document.getElementById('empty-state');
  const resultsCount = document.getElementById('results-count');
  const searchInput = document.getElementById('job-search');
  const areaSelect = document.getElementById('area-select');
  const pills = document.querySelectorAll('#modalidade-pills .pill');

  const state = { search: '', modalidade: 'all', area: 'all' };

  function modalidadeLabel(m) {
    return { remoto: 'Remoto', hibrido: 'Híbrido', presencial: 'Presencial' }[m] || m;
  }

  function renderCard(vaga) {
    const salarioHtml = vaga.salario
      ? `<span class="job-salary">${vaga.salario}</span>`
      : `<span class="job-salary hidden-salary">A combinar</span>`;
    const tagsHtml = vaga.tags.map(t => `<span class="tag">${t}</span>`).join('');

    return `
      <div class="job-card">
        <div class="job-card-header">
          <div class="job-logo">${vaga.iniciais}</div>
          <div>
            <div class="job-company">${vaga.empresa}</div>
            <div class="job-location">${vaga.local} · ${modalidadeLabel(vaga.modalidade)}</div>
          </div>
        </div>
        <div class="job-title">${vaga.titulo}</div>
        <div class="job-tags">
          <span class="tag modality">${vaga.tipo}</span>
          ${tagsHtml}
        </div>
        <div class="job-footer">
          ${salarioHtml}
          <button class="job-view-btn" onclick="window.location.href='oportunidade.html?id=${vaga.id}'">Ver detalhes ›</button>
        </div>
      </div>
    `;
  }

  function applyFilters() {
    const term = state.search.trim().toLowerCase();
    const filtered = MOCK_VAGAS.filter(v => {
      const matchesSearch = !term ||
        v.titulo.toLowerCase().includes(term) ||
        v.empresa.toLowerCase().includes(term) ||
        v.tags.some(t => t.toLowerCase().includes(term));
      const matchesModalidade = state.modalidade === 'all' || v.modalidade === state.modalidade;
      const matchesArea = state.area === 'all' || v.area === state.area;
      return matchesSearch && matchesModalidade && matchesArea;
    });

    grid.innerHTML = filtered.map(renderCard).join('');
    grid.style.display = filtered.length ? 'grid' : 'none';
    emptyState.style.display = filtered.length ? 'none' : 'flex';
    resultsCount.textContent = filtered.length === 1
      ? '1 vaga disponível'
      : `${filtered.length} vagas disponíveis`;
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.search = e.target.value;
      applyFilters();
    });
  }

  if (areaSelect) {
    areaSelect.addEventListener('change', (e) => {
      state.area = e.target.value;
      applyFilters();
    });
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.modalidade = pill.dataset.filter;
      applyFilters();
    });
  });

  document.addEventListener('DOMContentLoaded', applyFilters);
})();
