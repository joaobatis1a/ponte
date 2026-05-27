(function () {
  'use strict';

  const urlParams = new URLSearchParams(window.location.search);
  const desafioId = urlParams.get('id');
  const jovemId = localStorage.getItem('ponte_jovem_id');
  const API_BASE = "http://127.0.0.1:8000";
  let submissaoAtualId = null;

  async function init() {
      if (!desafioId || !jovemId) {
          alert("Sessão ou Desafio inválido. Voltando ao Feed.");
          window.location.href = "feed.html";
          return;
      }
      await loadUserProfile();
      await carregarDetalhesDoDesafio();
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
    try {
      const response = await fetch(`${API_BASE}/feed/desafios/${desafioId}`);
      const desafio = await response.json();

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
  }

  async function verificarStatusDesafio() {
      try {
          const res = await fetch(`${API_BASE}/feed/desafios/${desafioId}/status?jovem_id=${jovemId}`);
          const status = await res.json();
          submissaoAtualId = status.submissao ? status.submissao.id : null;
          atualizarInterface(status.aceito, status.submissao);
      } catch (e) { console.error(e); }
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
              btnAccept.disabled = true; btnAccept.textContent = "Salvando...";
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
      try {
          await fetch(`${API_BASE}/feed/submissao/${submissaoAtualId}`, { method: 'DELETE' });
          await verificarStatusDesafio();
      } catch (e) { alert("Erro ao excluir."); }
  }

  document.addEventListener('DOMContentLoaded', init);
})();