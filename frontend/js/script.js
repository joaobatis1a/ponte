(() => {
  const $ = (id) => document.getElementById(id);

  const form = $('form');
  const fields = ['nome', 'sobrenome', 'nascimento', 'cep'];
  const inputs = Object.fromEntries(fields.map((f) => [f, $(f)]));
  const errors = Object.fromEntries(fields.map((f) => [f, $(f + '-error')]));
  const progressBar = $('progressBar');
  const toast = $('toast');

  // ---------- Toast ----------
  let toastTimer;
  function showToast(msg, type = '') {
    toast.textContent = msg;
    toast.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.className = 'toast'), 2800);
  }

  // ---------- Masks ----------
  function maskDate(v) {
    const d = v.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return d.slice(0, 2) + '/' + d.slice(2);
    return d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4);
  }
  function maskCEP(v) {
    const d = v.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 5) return d;
    return d.slice(0, 5) + '-' + d.slice(5);
  }

  inputs.nascimento.addEventListener('input', (e) => {
    e.target.value = maskDate(e.target.value);
    clearError('nascimento');
    updateProgress();
  });
  inputs.cep.addEventListener('input', (e) => {
    e.target.value = maskCEP(e.target.value);
    clearError('cep');
    updateProgress();
  });
  ['nome', 'sobrenome'].forEach((k) => {
    inputs[k].addEventListener('input', () => {
      clearError(k);
      updateProgress();
    });
  });

  // ---------- Progress ----------
  function updateProgress() {
    const filled = fields.filter((f) => inputs[f].value.trim()).length;
    const pct = Math.min(100, 15 + (filled / fields.length) * 70);
    progressBar.style.width = pct + '%';
    progressBar.parentElement.setAttribute('aria-valuenow', Math.round(pct));
  }

  // ---------- Validation ----------
  function setError(field, msg) {
    errors[field].textContent = msg || '';
    inputs[field].classList.toggle('invalid', !!msg);
  }
  function clearError(field) {
    if (errors[field].textContent) setError(field, '');
  }

  function validate() {
    let ok = true;
    const v = {
      nome: inputs.nome.value.trim(),
      sobrenome: inputs.sobrenome.value.trim(),
      nascimento: inputs.nascimento.value.trim(),
      cep: inputs.cep.value.trim(),
    };

    if (!v.nome) { setError('nome', 'Informe teu nome'); ok = false; }
    else if (v.nome.length > 60) { setError('nome', 'Máx. 60 caracteres'); ok = false; }
    else setError('nome', '');

    if (!v.sobrenome) { setError('sobrenome', 'Informe teu sobrenome'); ok = false; }
    else if (v.sobrenome.length > 60) { setError('sobrenome', 'Máx. 60 caracteres'); ok = false; }
    else setError('sobrenome', '');

    const m = v.nascimento.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) { setError('nascimento', 'Use DD/MM/AAAA'); ok = false; }
    else {
      const [_, dd, mm, aaaa] = m;
      const day = +dd, month = +mm, year = +aaaa;
      const d = new Date(year, month - 1, day);
      const valid = d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
      if (!valid) { setError('nascimento', 'Data inválida'); ok = false; }
      else if (d > new Date()) { setError('nascimento', 'Data no futuro'); ok = false; }
      else if (year < 1900) { setError('nascimento', 'Ano inválido'); ok = false; }
      else setError('nascimento', '');
    }

    if (!/^\d{5}-\d{3}$/.test(v.cep)) { setError('cep', 'Use 00000-000'); ok = false; }
    else setError('cep', '');

    return { ok, v };
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { ok, v } = validate();
    if (!ok) {
      showToast('Confere os campos destacados', 'error');
      return;
    }
    localStorage.setItem('ponte_basico', JSON.stringify(v));
    showToast(`Show, ${v.nome}! Seguindo pro próximo passo…`, 'success');
    progressBar.style.width = '40%';
    setTimeout(() => { window.location.href = 'auth.html'; }, 700);
  });

  // ---------- Photo upload ----------
  const photoBtn = $('photoBtn');
  const photoInput = $('photoInput');
  const photoPreview = $('photoPreview');
  const photoPlus = $('photoPlus');

  photoBtn.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToast('Selecione uma imagem válida', 'error');
    if (file.size > 4 * 1024 * 1024) return showToast('Imagem muito grande (máx. 4MB)', 'error');
    const reader = new FileReader();
    reader.onload = () => {
      photoPreview.src = reader.result;
      photoPreview.hidden = false;
      photoPlus.hidden = true;
      try { localStorage.setItem('ponte_foto', reader.result); } catch {}
    };
    reader.readAsDataURL(file);
  });

  // ---------- Top buttons ----------
  $('helpBtn').addEventListener('click', () => showToast('Precisa de ajuda? Estamos aqui 🦀'));
  $('closeBtn').addEventListener('click', () => showToast('Saída cancelada — segue o jogo!'));
  $('prevBtn').addEventListener('click', () => showToast('Já estamos no início 🙂'));

  updateProgress();
})();
