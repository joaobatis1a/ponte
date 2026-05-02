(() => {
  const form = document.getElementById('form');
  const instituicao = document.getElementById('instituicao');
  const cidade = document.getElementById('cidade');
  const curso = document.getElementById('curso');
  const inicio = document.getElementById('inicio');
  const fim = document.getElementById('fim');
  const addBtn = document.getElementById('addFormacao');
  const list = document.getElementById('formacoesList');
  const prevBtn = document.getElementById('prevBtn');
  const helpBtn = document.getElementById('helpBtn');
  const closeBtn = document.getElementById('closeBtn');
  const toast = document.getElementById('toast');

  let formacoes = [];
  try {
    formacoes = JSON.parse(localStorage.getItem('ponte_formacoes') || '[]');
  } catch { formacoes = []; }

  // Mantém cor do placeholder dos selects
  [instituicao, cidade, curso].forEach(sel => {
    sel.addEventListener('change', () => {
      sel.classList.remove('placeholder', 'invalid');
      clearError(sel.id);
    });
  });

  // Máscara DD/MM/AA
  function maskDateShort(v) {
    v = v.replace(/\D/g, '').slice(0, 6);
    if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
    else if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
    return v;
  }
  [inicio, fim].forEach(input => {
    input.addEventListener('input', () => {
      input.value = maskDateShort(input.value);
      clearError(input.id);
      input.classList.remove('invalid');
    });
  });

  function showToast(msg, type = '') {
    toast.textContent = msg;
    toast.className = 'toast show ' + type;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function setError(id, msg) {
    const el = document.getElementById(id + '-error');
    const input = document.getElementById(id);
    if (el) el.textContent = msg;
    if (input) input.classList.add('invalid');
  }
  function clearError(id) {
    const el = document.getElementById(id + '-error');
    const input = document.getElementById(id);
    if (el) el.textContent = '';
    if (input) input.classList.remove('invalid');
  }

  function isValidShortDate(v) {
    if (!/^\d{2}\/\d{2}\/\d{2}$/.test(v)) return false;
    const [d, m, y] = v.split('/').map(Number);
    if (m < 1 || m > 12) return false;
    const fullY = 2000 + y;
    const dim = new Date(fullY, m, 0).getDate();
    return d >= 1 && d <= dim;
  }
  function parseShortDate(v) {
    const [d, m, y] = v.split('/').map(Number);
    return new Date(2000 + y, m - 1, d);
  }

  function validateFormacao() {
    let ok = true;
    if (!instituicao.value) { setError('instituicao', 'Selecione a instituição.'); instituicao.classList.add('invalid'); ok = false; }
    if (!cidade.value) { setError('cidade', 'Selecione a cidade.'); cidade.classList.add('invalid'); ok = false; }
    if (!curso.value) { setError('curso', 'Selecione o curso.'); curso.classList.add('invalid'); ok = false; }
    if (!inicio.value) { setError('inicio', 'Informe o início.'); ok = false; }
    else if (!isValidShortDate(inicio.value)) { setError('inicio', 'Data inválida.'); ok = false; }
    if (fim.value && !isValidShortDate(fim.value)) { setError('fim', 'Data inválida.'); ok = false; }
    if (ok && fim.value) {
      if (parseShortDate(fim.value) < parseShortDate(inicio.value)) {
        setError('fim', 'Fim antes do início.'); ok = false;
      }
    }
    return ok;
  }

  function renderList() {
    list.innerHTML = '';
    formacoes.forEach((f, i) => {
      const item = document.createElement('div');
      item.className = 'formacao-item';
      item.innerHTML = `
        <div class="formacao-item-info">
          <p class="formacao-item-title">${escapeHtml(f.curso)} — ${escapeHtml(f.instituicao)}</p>
          <p class="formacao-item-meta">${escapeHtml(f.cidade)} · ${escapeHtml(f.inicio)}${f.fim ? ' até ' + escapeHtml(f.fim) : ' · cursando'}</p>
        </div>
        <button type="button" aria-label="Remover formação" data-i="${i}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></svg>
        </button>`;
      list.appendChild(item);
    });
    list.querySelectorAll('button[data-i]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        formacoes.splice(i, 1);
        save();
        renderList();
        showToast('Formação removida.', 'success');
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function save() {
    localStorage.setItem('ponte_formacoes', JSON.stringify(formacoes));
  }

  function clearForm() {
    [instituicao, cidade, curso].forEach(sel => { sel.value = ''; sel.classList.add('placeholder'); });
    inicio.value = '';
    fim.value = '';
    ['instituicao', 'cidade', 'curso', 'inicio', 'fim'].forEach(clearError);
  }

  addBtn.addEventListener('click', () => {
    if (!validateFormacao()) {
      showToast('Preencha os campos corretamente.', 'error');
      return;
    }
    formacoes.push({
      instituicao: instituicao.value,
      cidade: cidade.value,
      curso: curso.value,
      inicio: inicio.value,
      fim: fim.value || ''
    });
    save();
    renderList();
    clearForm();
    showToast('Formação adicionada!', 'success');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Se preencheu campos sem clicar em adicionar, valida e adiciona
    const algumPreenchido = instituicao.value || cidade.value || curso.value || inicio.value || fim.value;
    if (algumPreenchido) {
      if (!validateFormacao()) {
        showToast('Preencha corretamente ou limpe os campos.', 'error');
        return;
      }
      formacoes.push({
        instituicao: instituicao.value, cidade: cidade.value, curso: curso.value,
        inicio: inicio.value, fim: fim.value || ''
      });
      save();
    }
    showToast('Formações salvas! Indo para revisão...', 'success');
    setTimeout(() => { window.location.href = 'pronto.html'; }, 700);
  });

  prevBtn.addEventListener('click', () => { window.location.href = 'auth.html'; });
  closeBtn.addEventListener('click', () => {
    if (confirm('Deseja sair? Suas formações ficam salvas.')) window.location.href = 'index.html';
  });
  helpBtn.addEventListener('click', () => {
    showToast('Adicione cada formação e clique em "Adicionar Formação +".');
  });

  renderList();
})();
