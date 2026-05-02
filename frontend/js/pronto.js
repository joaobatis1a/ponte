(() => {
  const reviewCard = document.getElementById('reviewCard');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const helpBtn = document.getElementById('helpBtn');
  const closeBtn = document.getElementById('closeBtn');
  const toast = document.getElementById('toast');

  function showToast(msg, type = '') {
    toast.textContent = msg;
    toast.className = 'toast show ' + type;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Recupera dados salvos pelas telas anteriores
  let basico = {};
  let auth = {};
  let formacoes = [];
  try { basico = JSON.parse(localStorage.getItem('ponte_basico') || '{}'); } catch {}
  try { auth = JSON.parse(localStorage.getItem('ponte_auth') || '{}'); } catch {}
  try { formacoes = JSON.parse(localStorage.getItem('ponte_formacoes') || '[]'); } catch {}

  const photo = localStorage.getItem('ponte_foto') || '';
  const nomeCompleto = [basico.nome, basico.sobrenome].filter(Boolean).join(' ') || '—';

  function row(k, v) {
    return `<div class="review-row"><span class="k">${escapeHtml(k)}</span><span class="v">${escapeHtml(v || '—')}</span></div>`;
  }

  const formacoesHtml = formacoes.length
    ? `<div class="review-list">${formacoes.map(f => `
        <div class="item">
          <p class="t">${escapeHtml(f.curso)} — ${escapeHtml(f.instituicao)}</p>
          <p class="m">${escapeHtml(f.cidade)} · ${escapeHtml(f.inicio)}${f.fim ? ' até ' + escapeHtml(f.fim) : ' · cursando'}</p>
        </div>`).join('')}</div>`
    : `<p class="review-empty">Nenhuma formação adicionada.</p>`;

  reviewCard.innerHTML = `
    <div class="review-photo">
      ${photo
        ? `<img src="${photo}" alt="Foto de perfil" />`
        : `<div class="ph" aria-hidden="true">
             <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
           </div>`}
      <div>
        <p class="name">${escapeHtml(nomeCompleto)}</p>
        <p class="sub">${escapeHtml(auth.email || 'sem email cadastrado')}</p>
      </div>
    </div>

    <div class="review-section">
      <div class="section-header">
        <h3>Dados pessoais</h3>
        <button type="button" class="edit-link" data-go="index.html">Editar</button>
      </div>
      ${row('Nascimento', basico.nascimento)}
      ${row('CEP', basico.cep)}
    </div>

    <div class="review-section">
      <div class="section-header">
        <h3>Autenticação</h3>
        <button type="button" class="edit-link" data-go="auth.html">Editar</button>
      </div>
      ${row('Email', auth.email)}
      ${row('Senha', auth.senha ? '•'.repeat(Math.min(auth.senha.length, 10)) : '—')}
    </div>

    <div class="review-section">
      <div class="section-header">
        <h3>Formações</h3>
        <button type="button" class="edit-link" data-go="formacoes.html">Editar</button>
      </div>
      ${formacoesHtml}
    </div>
  `;

  reviewCard.querySelectorAll('.edit-link').forEach(b =>
    b.addEventListener('click', () => { window.location.href = b.dataset.go; })
  );

  prevBtn.addEventListener('click', () => { window.location.href = 'formacoes.html'; });
  nextBtn.addEventListener('click', () => {
    showToast('Bora conversar com o Manguelito! 🦀', 'success');
    setTimeout(() => alert('Cadastro concluído com sucesso!\n\nEm breve: chat com o Manguelito.'), 700);
  });
  closeBtn.addEventListener('click', () => {
    if (confirm('Deseja sair?')) window.location.href = 'index.html';
  });
  helpBtn.addEventListener('click', () => {
    showToast('Confira tudo e clique em Próximo para finalizar.');
  });
})();
