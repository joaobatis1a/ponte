(function () {
  'use strict';

  const urlParams = new URLSearchParams(window.location.search);
  const desafioId = urlParams.get('id');
  const jovemId = localStorage.getItem('ponte_jovem_id');
  const CONFIG = window.PONTE_CONFIG || { MODO_DEMO: true, API_BASE_URL: 'http://127.0.0.1:8000' };
  const API_BASE = CONFIG.API_BASE_URL;
  let submissaoAtualId = null;
  // Estado local usado só quando MODO_DEMO está ligado — permite simular
  // "aceitar" e "enviar resolução" sem depender do backend.
  const demoState = { aceito: false, submissao: null };

  // ---------------------------------------------------------------
  // Dados mockados — espelham os cards mostrados em feed.js (mesmos
  // desafio_id), agora com os campos completos que a página de
  // detalhes precisa. Usados como fallback sempre que a API não
  // estiver disponível ou não conhecer o desafio (ex.: ambiente de
  // demo, ou quando o id clicado veio de um card mockado).
  // ---------------------------------------------------------------
  const MOCK_DESAFIOS_DETALHADOS = {
    'mock-1': {
      desafio_id: 'mock-1', tipo: 'desafio', empresa_id: 'solvex_solutions',
      titulo: 'Redesign do app de delivery local',
      descricao_longa: 'Repense a experiência de pedido de um app de delivery de bairro, do cardápio ao checkout, pensando em quem tem pouca familiaridade com apps. Mapeie o fluxo atual, identifique pontos de atrito e proponha uma nova jornada mais simples e acessível.',
      prazo: '18 de julho',
      recompensa: { xp: 450, emblema: 'Designer de Experiências', rarity: 'Raro' },
      requisitos: [{ nome: 'Figma' }, { nome: 'UX Research' }],
      entregaveis: [
        { descricao: 'Protótipo navegável (link do Figma)', opcional: false },
        { descricao: 'Relatório curto com os principais problemas encontrados', opcional: false },
        { descricao: 'Vídeo de até 2 min explicando a solução', opcional: true }
      ],
      dica_manguelito: 'Ei! Pensa em como alguém que nunca usou um app assim ia se sentir perdido. Simplicidade é a chave aqui. 🦀',
      total_participantes: 14,
      empresa_info: { nome: 'Solvex Solutions', initialiais: 'SS', localizacao: 'Olinda · PE', bio: 'Uma startup que valoriza raízes pernambucanas, elevando o mercado de trabalho local.', url_perfil: '#' }
    },
    'mock-2': {
      desafio_id: 'mock-2', tipo: 'desafio', empresa_id: 'recibyte_tech',
      titulo: 'Landing page para lançamento de produto',
      descricao_longa: 'Monte uma landing page responsiva para o lançamento de um novo produto de tecnologia, com foco em conversão. A página deve funcionar bem em desktop e mobile e ter uma chamada de ação clara.',
      prazo: '25 de julho',
      recompensa: { xp: 280, emblema: 'Front-end Iniciante', rarity: 'Comum' },
      requisitos: [{ nome: 'HTML' }, { nome: 'CSS' }, { nome: 'JavaScript' }],
      entregaveis: [
        { descricao: 'Código-fonte da landing page', opcional: false },
        { descricao: 'Link do deploy (Vercel, Netlify ou similar)', opcional: false }
      ],
      dica_manguelito: 'Capricha na primeira dobra da página — é o que decide se a pessoa continua rolando ou não. 🦀',
      total_participantes: 22,
      empresa_info: { nome: 'Recibyte Tech', initialiais: 'RT', localizacao: 'Recife · PE', bio: 'Empresa de tecnologia focada em soluções digitais para pequenos negócios.', url_perfil: '#' }
    },
    'mock-3': {
      desafio_id: 'mock-3', tipo: 'desafio', empresa_id: 'nordeste_labs',
      titulo: 'Automatizar planilha de controle de estoque',
      descricao_longa: 'Crie uma automação simples para reduzir o trabalho manual de atualização de estoque de um pequeno comércio, usando fórmulas ou scripts que evitem erros de digitação.',
      prazo: '12 de julho',
      recompensa: { xp: 220, emblema: 'Suporte Nível 1', rarity: 'Comum' },
      requisitos: [{ nome: 'Excel' }, { nome: 'Automação' }],
      entregaveis: [
        { descricao: 'Planilha automatizada', opcional: false },
        { descricao: 'Passo a passo de como usar', opcional: false }
      ],
      dica_manguelito: 'Testa com dados reais de estoque pra ver se a automação não quebra em casos estranhos. 🦀',
      total_participantes: 9,
      empresa_info: { nome: 'Nordeste Labs', initialiais: 'NL', localizacao: 'Caruaru · PE', bio: 'Laboratório de inovação que apoia pequenos comércios da região.', url_perfil: '#' }
    },
    'mock-4': {
      desafio_id: 'mock-4', tipo: 'desafio', empresa_id: 'bytemakers',
      titulo: 'API de recomendação de conteúdo',
      descricao_longa: 'Desenvolva uma API simples que recomenda conteúdos com base no histórico de interações do usuário. Foque em uma solução funcional, ainda que com uma regra de recomendação simples.',
      prazo: '02 de agosto',
      recompensa: { xp: 600, emblema: 'Back-end Pleno', rarity: 'Épico' },
      requisitos: [{ nome: 'Node.js' }, { nome: 'API REST' }],
      entregaveis: [
        { descricao: 'Repositório com o código da API', opcional: false },
        { descricao: 'Documentação dos endpoints', opcional: false }
      ],
      dica_manguelito: 'Não precisa reinventar um algoritmo complexo — uma regra simples e bem explicada já mostra teu raciocínio. 🦀',
      total_participantes: 6,
      empresa_info: { nome: 'Bytemakers', initialiais: 'BM', localizacao: 'Recife · PE', bio: 'Estúdio de software especializado em produtos digitais escaláveis.', url_perfil: '#' }
    },
    'mock-5': {
      desafio_id: 'mock-5', tipo: 'desafio', empresa_id: 'vitrine_pe',
      titulo: 'Identidade visual pra loja de artesanato',
      descricao_longa: 'Crie uma identidade visual simples (logo + paleta) para uma loja de artesanato local que está migrando pro digital, mantendo a essência artesanal da marca.',
      prazo: '30 de julho',
      recompensa: { xp: 380, emblema: 'Designer Gráfico Iniciante', rarity: 'Raro' },
      requisitos: [{ nome: 'Illustrator' }, { nome: 'Branding' }],
      entregaveis: [
        { descricao: 'Logo em vetor (.ai ou .svg)', opcional: false },
        { descricao: 'Paleta de cores e pequeno manual de uso', opcional: false }
      ],
      dica_manguelito: 'Conversa (mesmo que só na imaginação) com quem faria esse artesanato — a marca tem que parecer com a história dela. 🦀',
      total_participantes: 11,
      empresa_info: { nome: 'Vitrine PE', initialiais: 'VP', localizacao: 'Recife · PE', bio: 'Vitrine digital para pequenos empreendedores e artesãos pernambucanos.', url_perfil: '#' }
    },
    'mock-curso-1': {
      desafio_id: 'mock-curso-1', tipo: 'curso', empresa_id: 'ponte_academy',
      titulo: 'Fundamentos de UX Research',
      descricao_longa: 'Curso introdutório sobre como conduzir entrevistas, testes de usabilidade e sintetizar aprendizados em insights acionáveis para o design de produtos.',
      prazo: 'Acesso imediato',
      recompensa: { xp: 150, emblema: 'Pesquisador Iniciante', rarity: 'Comum' },
      requisitos: [{ nome: 'Sem pré-requisitos' }],
      entregaveis: [{ descricao: 'Quiz final do curso', opcional: false }],
      dica_manguelito: 'Presta atenção nos exemplos de perguntas de entrevista — vão te ajudar demais nos próximos desafios. 🦀',
      total_participantes: 58,
      empresa_info: { nome: 'Ponte Academy', initialiais: 'PA', localizacao: 'Online', bio: 'A trilha de cursos da própria P.O.N.T.E. para destravar novas habilidades.', url_perfil: '#' }
    },
    'mock-curso-2': {
      desafio_id: 'mock-curso-2', tipo: 'curso', empresa_id: 'ponte_academy',
      titulo: 'Suporte técnico na prática',
      descricao_longa: 'Aprenda a diagnosticar e resolver os problemas mais comuns de redes e hardware do dia a dia, com foco em situações reais de suporte.',
      prazo: 'Acesso imediato',
      recompensa: { xp: 150, emblema: 'Suporte Nível 1', rarity: 'Comum' },
      requisitos: [{ nome: 'Sem pré-requisitos' }],
      entregaveis: [{ descricao: 'Quiz final do curso', opcional: false }],
      dica_manguelito: 'Sempre pergunta "o que mudou desde a última vez que funcionou?" — resolve metade dos chamados. 🦀',
      total_participantes: 41,
      empresa_info: { nome: 'Ponte Academy', initialiais: 'PA', localizacao: 'Online', bio: 'A trilha de cursos da própria P.O.N.T.E. para destravar novas habilidades.', url_perfil: '#' }
    },
    'mock-evento-1': {
      desafio_id: 'mock-evento-1', tipo: 'evento', empresa_id: 'hackathon_nordeste',
      titulo: 'Hackathon Nordeste 2026',
      descricao_longa: '48 horas de maratona de projetos com mentoria de empresas parceiras e premiação em XP e prêmios reais. Forme equipe ou entre em uma durante o evento.',
      prazo: '20 e 21 de julho',
      recompensa: { xp: 800, emblema: 'Maratonista', rarity: 'Épico' },
      requisitos: [{ nome: 'Trabalho em equipe' }],
      entregaveis: [{ descricao: 'Apresentação final do projeto', opcional: false }],
      dica_manguelito: 'Dorme um pouco, hidrata e escolhe uma equipe com quem tu se comunica bem — isso importa mais que a ideia perfeita. 🦀',
      total_participantes: 96,
      empresa_info: { nome: 'Hackathon Nordeste', initialiais: 'HN', localizacao: 'Recife · PE', bio: 'Evento colaborativo que reúne empresas parceiras da P.O.N.T.E. em Pernambuco.', url_perfil: '#' }
    }
  };

  async function init() {
      if (!desafioId) {
          alert("Nenhum desafio foi informado. Voltando ao Feed.");
          window.location.href = "feed.html";
          return;
      }
      if (jovemId && !CONFIG.MODO_DEMO) await loadUserProfile();
      const encontrado = await carregarDetalhesDoDesafio();
      if (!encontrado) {
          alert("Este desafio não existe ou não está mais disponível. Voltando ao Feed.");
          window.location.href = "feed.html";
          return;
      }
      await verificarStatusDesafio();
      configurarEventos();
  }

  async function loadUserProfile() {
    try {
      const res = await fetch(`${API_BASE}/profile/${jovemId}`);
      if (!res.ok) return;
      const data = await res.json();
      
      // Ajusta o sidebar original
      const avatar = document.querySelector('.user-avatar');
      const name = document.querySelector('.user-info .name');
      const lvl = document.querySelector('.user-info .lvl');
      
      if(avatar && data.nome) avatar.textContent = (data.nome[0] + (data.sobrenome ? data.sobrenome[0] : '')).toUpperCase();
      if(name) name.textContent = `${data.nome} ${data.sobrenome}`;
      if(lvl) lvl.textContent = `⚡ LVL ${data.nivel || 'Iniciante'} · ${data.xp || 0} XP`;
    } catch (e) {}
  }

  async function carregarDetalhesDoDesafio() {
    let desafio = null;

    if (!CONFIG.MODO_DEMO) {
      try {
        const response = await fetch(`${API_BASE}/feed/desafios/${desafioId}`);
        if (response.ok) {
          const dados = await response.json();
          if (dados && dados.titulo) desafio = dados;
        }
      } catch (e) {
        console.warn('[Desafio-Debug] API indisponível, tentando dados de demonstração.', e);
      }
    }

    if (!desafio) desafio = MOCK_DESAFIOS_DETALHADOS[desafioId];

    if (!desafio) {
      console.error(`[Desafio-Debug] Nenhum desafio encontrado (API ou mock) para o id: ${desafioId}`);
      return false;
    }

    try {
      // Funções para injetar direto nos placeholders do HTML original
      const setHtml = (selector, html) => { const el = document.querySelector(selector); if(el) el.innerHTML = html; };
      const setText = (selector, text) => { const el = document.querySelector(selector); if(el) el.textContent = text; };

      // ───── INFORMAÇÕES PRINCIPAIS DO DESAFIO ─────
      setHtml('[data-placeholder="challenge-title"]', desafio.titulo);
      setHtml('[data-placeholder="challenge-description"]', desafio.descricao_longa || desafio.descricao); 
      setText('[data-placeholder="challenge-xp"]', `+${desafio.recompensa?.xp || 0} XP`);
      setText('[data-placeholder="challenge-deadline"]', desafio.prazo || 'Sem prazo');
      setText('[data-placeholder="challenge-title-short"]', desafio.titulo.substring(0, 30) + '...');
      setText('[data-placeholder="challenge-type"]', desafio.tipo ? desafio.tipo.charAt(0).toUpperCase() + desafio.tipo.slice(1) : 'Desafio');
      setText('[data-placeholder="mascot-tip"]', desafio.dica_manguelito);
      setText('[data-placeholder="mascot-name"]', 'Manguelito');

      // ───── INFORMAÇÕES DA EMPRESA ─────
      const empresaInfo = desafio.empresa_info || {};
      const initials = empresaInfo.initialiais || desafio.empresa_id?.substring(0, 2).toUpperCase() || 'XX';
      const nomeEmpresa = empresaInfo.nome || 'Empresa Confidencial';
      const localEmpresa = empresaInfo.localizacao || 'Pernambuco';
      const bioEmpresa = empresaInfo.bio || 'Uma empresa parceira da P.O.N.T.E.';
      const urlPerfil = empresaInfo.url_perfil || '#';

      // Atualiza iniciais da empresa (pode haver vários placeholders)
      document.querySelectorAll('[data-placeholder="company-logo-initials"]').forEach(el => {
        el.textContent = initials;
      });
      
      // Atualiza nome da empresa (pode haver vários placeholders)
      document.querySelectorAll('[data-placeholder="company-name"]').forEach(el => {
        el.textContent = nomeEmpresa;
      });
      
      // Atualiza localização da empresa (pode haver vários placeholders)
      document.querySelectorAll('[data-placeholder="company-location"]').forEach(el => {
        el.textContent = localEmpresa;
      });

      setText('[data-placeholder="company-bio"]', bioEmpresa);
      
      const profileBtn = document.querySelector('[data-placeholder="company-profile-url"]');
      if (profileBtn && urlPerfil !== '#') {
        profileBtn.href = urlPerfil;
      }

      // ───── REQUISITOS (lista renderizável) ─────
      const reqContainer = document.querySelector('.req-list');
      if (reqContainer && desafio.requisitos && desafio.requisitos.length > 0) {
        reqContainer.innerHTML = desafio.requisitos.map(req => `
          <li class="req-item">
            <span class="req-icon desafio">✦</span>
            <span><strong>${req.nome}</strong></span>
          </li>
        `).join('');
      }

      // ───── ENTREGÁVEIS (lista renderizável) ─────
      const delivContainer = document.querySelector('.deliverable-list');
      if (delivContainer && desafio.entregaveis && desafio.entregaveis.length > 0) {
        delivContainer.innerHTML = desafio.entregaveis.map(deliv => `
          <li>
            <span class="deliv-bullet ${deliv.opcional ? 'optional' : ''}">›</span>
            ${deliv.descricao} ${deliv.opcional ? '<em>(OPCIONAL)</em>' : ''}
          </li>
        `).join('');
      }

      // ───── RECOMPENSAS ─────
      setText('[data-placeholder="reward-xp"]', `+${desafio.recompensa?.xp || 0} XP`);
      setText('[data-placeholder="reward-badge"]', desafio.recompensa?.emblema || 'Designer Iniciante');
      setText('[data-placeholder="reward-badge-rarity"]', desafio.recompensa?.rarity || 'No PP');

      // ───── PARTICIPANTES ─────
      setText('[data-placeholder="participant-count"]', `${desafio.total_participantes || 0} participando`);
      
      if (desafio.total_participantes > 3) {
        setText('[data-placeholder="extra-participants-count"]', `+${desafio.total_participantes - 3}`);
      }
    } catch (e) { console.error("Erro ao montar detalhes", e); }

    return true;
  }

  async function verificarStatusDesafio() {
      if (CONFIG.MODO_DEMO) {
          submissaoAtualId = demoState.submissao ? demoState.submissao.id : null;
          atualizarInterface(demoState.aceito, demoState.submissao);
          return;
      }
      if (!jovemId) {
          // Modo visitante: sem sessão não há como saber se o desafio já
          // foi aceito, então mostramos o estado inicial (não aceito).
          atualizarInterface(false, null);
          return;
      }
      try {
          const res = await fetch(`${API_BASE}/feed/desafios/${desafioId}/status?jovem_id=${jovemId}`);
          if (!res.ok) { atualizarInterface(false, null); return; }
          const status = await res.json();
          submissaoAtualId = status.submissao ? status.submissao.id : null;
          atualizarInterface(status.aceito, status.submissao);
      } catch (e) {
          console.error(e);
          atualizarInterface(false, null);
      }
  }

  function atualizarInterface(aceito, submissao) {
      const btnAccept = document.getElementById('btn-accept');
      const btnSubmit = document.getElementById('btn-submit'); // Botão da barra azul
      const formSubmissao = document.getElementById('form-submissao');
      const containerEntregaveis = document.getElementById('section-submission-form');
      
      const oldFeedback = document.getElementById('feedback-submissao');
      if (oldFeedback) oldFeedback.remove();

      if (!aceito) {
          if (btnAccept) { btnAccept.style.display = 'inline-flex'; btnAccept.disabled = false; btnAccept.innerHTML = `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg> Aceitar Desafio`; }
          if (btnSubmit) btnSubmit.hidden = true;
          if (formSubmissao) formSubmissao.style.display = 'none';
          if (containerEntregaveis) { containerEntregaveis.style.opacity = '0.4'; containerEntregaveis.style.pointerEvents = 'none'; }
      } 
      else if (aceito && !submissao) {
          if (btnAccept) btnAccept.style.display = 'none';
          if (btnSubmit) btnSubmit.hidden = false; 
          if (containerEntregaveis) { containerEntregaveis.style.opacity = '1'; containerEntregaveis.style.pointerEvents = 'auto'; }
          if (formSubmissao) formSubmissao.style.display = 'block';
      } 
      else if (aceito && submissao) {
          if (btnAccept) btnAccept.style.display = 'none';
          if (btnSubmit) btnSubmit.hidden = true;
          if (formSubmissao) formSubmissao.style.display = 'none'; 
          if (containerEntregaveis) {
              containerEntregaveis.style.opacity = '1'; containerEntregaveis.style.pointerEvents = 'auto';
              const feedbackUI = document.createElement('div');
              feedbackUI.id = 'feedback-submissao';
              feedbackUI.innerHTML = `
                  <div style="background: #e8f5e9; border: 1px solid #4caf50; padding: 15px; border-radius: 8px; margin-top: 20px;">
                      <p style="color: #2e7d32; font-weight: bold; margin-bottom: 10px;">✅ Resolução Enviada e Salva!</p>
                      <div style="display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
                          <a href="${submissao.link_externo}" target="_blank" style="color: #1976d2; text-decoration: none; word-break: break-all; margin-right: 15px;">🔗 ${submissao.link_externo}</a>
                          <button id="btn-excluir-submissao" style="background: #ff4d4d; color: white; border: none; border-radius: 50%; min-width: 30px; height: 30px; cursor: pointer; font-weight: bold;">✕</button>
                      </div>
                  </div>`;
              containerEntregaveis.appendChild(feedbackUI);
              document.getElementById('btn-excluir-submissao').addEventListener('click', deletarSubmissao);
          }
      }
  }

  function configurarEventos() {
      const btnAccept = document.getElementById('btn-accept');
      const formSubmissao = document.getElementById('form-submissao');
      const btnSubmitBlue = document.getElementById('btn-submit'); // O botão azul do rodapé
      
      if (btnAccept) {
          btnAccept.onclick = async () => {
              if (!jovemId) {
                  alert("Você precisa entrar na tua conta pra aceitar este desafio.");
                  window.location.href = "login.html";
                  return;
              }
              btnAccept.disabled = true; btnAccept.textContent = "Salvando...";

              if (CONFIG.MODO_DEMO) {
                  demoState.aceito = true;
                  await verificarStatusDesafio();
                  document.getElementById('section-submission-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
                  return;
              }

              try {
                  await fetch(`${API_BASE}/feed/desafios/${desafioId}/aceitar`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jovem_id: jovemId })
                  });
                  await verificarStatusDesafio();
                  
                  // Rola a tela suavemente para o formulário
                  document.getElementById('section-submission-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
              } catch (e) { alert("Erro ao aceitar o desafio."); }
          };
      }

      // Conecta o botão azul da barra inferior com o envio do formulário
      if (btnSubmitBlue && formSubmissao) {
          btnSubmitBlue.onclick = () => {
              const submitFormBtn = formSubmissao.querySelector('button[type="submit"]');
              if (submitFormBtn) submitFormBtn.click();
          };
      }

      // O motor de envio
      if (formSubmissao) {
          formSubmissao.onsubmit = async (e) => {
              e.preventDefault();
              const link_externo = document.getElementById('campo-link').value;
              const descricao = document.getElementById('campo-texto').value;

              if (!link_externo || !link_externo.includes('drive.google.com')) {
                  alert("Cancela! O link tem que ser do Google Drive."); return;
              }

              if (CONFIG.MODO_DEMO) {
                  demoState.submissao = { id: 'demo-submissao', link_externo, descricao };
                  await verificarStatusDesafio();
                  return;
              }

              try {
                  await fetch(`${API_BASE}/feed/submissao`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ jovem_id: jovemId, desafio_id: desafioId, link_externo, descricao })
                  });
                  await verificarStatusDesafio();
              } catch (erro) { alert("Falha no servidor."); }
          };
      }
  }

  async function deletarSubmissao() {
      if (!submissaoAtualId) return;
      if (!confirm("Desejas mesmo apagar esta resolução?")) return;

      if (CONFIG.MODO_DEMO) {
          demoState.submissao = null;
          await verificarStatusDesafio();
          return;
      }

      try {
          await fetch(`${API_BASE}/feed/submissao/${submissaoAtualId}`, { method: 'DELETE' });
          await verificarStatusDesafio();
      } catch (e) { alert("Erro ao excluir."); }
  }

  document.addEventListener('DOMContentLoaded', init);
})();