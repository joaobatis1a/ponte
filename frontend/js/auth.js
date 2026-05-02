(() => {
  const $ = (s) => document.querySelector(s);
  const form = $('#authForm');
  const email = $('#email');
  const senha = $('#senha');
  const confirmar = $('#confirmar');
  const robot = $('#robot');
  const captcha = $('#captcha');
  const captchaCheck = document.querySelector('.captcha-check');
  const progressFill = document.querySelector('.progress-fill');

  // Toast
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg, type = 'info') {
    toastEl.textContent = msg;
    toastEl.className = 'toast show ' + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toastEl.className = 'toast'), 2600);
  }

  // Topbar
  $('#helpBtn').addEventListener('click', () => toast('Precisa de ajuda? Estamos aqui 🦀'));
  $('#closeBtn').addEventListener('click', () => toast('Saída cancelada — segue o jogo!'));

  // Toggle visibilidade da senha
  document.querySelectorAll('.eye').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      btn.querySelector('.eye-off').hidden = isPwd;
      btn.querySelector('.eye-on').hidden = !isPwd;
      btn.setAttribute('aria-label', isPwd ? 'Ocultar senha' : 'Mostrar senha');
    });
  });

  // Captcha simulado
  let captchaVerified = false;
  captchaCheck.addEventListener('click', (e) => {
    if (captchaVerified) return;
    e.preventDefault();
    if (captchaCheck.classList.contains('loading')) return;
    captchaCheck.classList.add('loading');
    setTimeout(() => {
      captchaCheck.classList.remove('loading');
      robot.checked = true;
      captchaVerified = true;
      hideError('captcha');
      updateProgress();
    }, 900);
  });

  // Força da senha
  function passwordStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0..5
  }
  const strengthEl = $('#strength');
  const strengthFill = $('#strengthFill');
  const strengthLabel = $('#strengthLabel');
  const colors = ['#c0392b', '#e67e22', '#f1c40f', '#27ae60', '#1e8449'];
  const labels = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];

  senha.addEventListener('input', () => {
    const v = senha.value;
    if (!v) { strengthEl.hidden = true; updateProgress(); return; }
    strengthEl.hidden = false;
    const s = Math.max(1, passwordStrength(v));
    const idx = Math.min(s - 1, 4);
    strengthFill.style.width = (s / 5) * 100 + '%';
    strengthFill.style.background = colors[idx];
    strengthLabel.textContent = labels[idx];
    strengthLabel.style.color = colors[idx];
    hideError('senha');
    updateProgress();
  });

  email.addEventListener('input', () => { hideError('email'); updateProgress(); });
  confirmar.addEventListener('input', () => { hideError('confirmar'); updateProgress(); });

  function updateProgress() {
    let filled = 0;
    if (/^\S+@\S+\.\S+$/.test(email.value.trim())) filled++;
    if (senha.value.length >= 8 && /\d/.test(senha.value) && /[A-Za-z]/.test(senha.value)) filled++;
    if (confirmar.value && confirmar.value === senha.value) filled++;
    if (captchaVerified) filled++;
    const pct = 40 + (filled / 4) * 50;
    progressFill.style.width = Math.min(95, pct) + '%';
  }

  function showError(id, msg) {
    const el = document.getElementById(id + '-error');
    el.textContent = msg;
    el.hidden = false;
    const input = document.getElementById(id);
    if (input) input.classList.add('invalid');
  }
  function hideError(id) {
    const el = document.getElementById(id + '-error');
    if (el) el.hidden = true;
    const input = document.getElementById(id);
    if (input) input.classList.remove('invalid');
  }

  // Validação
  function validate() {
    let ok = true;
    const emailVal = email.value.trim();
    if (!emailVal) { showError('email', 'Informe teu email'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailVal)) { showError('email', 'Email inválido'); ok = false; }
    else if (emailVal.length > 120) { showError('email', 'Máx. 120 caracteres'); ok = false; }

    const pwd = senha.value;
    if (!pwd) { showError('senha', 'Informe uma senha'); ok = false; }
    else if (pwd.length < 8) { showError('senha', 'Mínimo de 8 caracteres'); ok = false; }
    else if (!/\d/.test(pwd) || !/[A-Za-z]/.test(pwd)) { showError('senha', 'Use letras e números'); ok = false; }

    if (!confirmar.value) { showError('confirmar', 'Confirme a senha'); ok = false; }
    else if (confirmar.value !== pwd) { showError('confirmar', 'As senhas não coincidem'); ok = false; }

    if (!captchaVerified) {
      showError('captcha', 'Confirme que você não é um robô');
      captcha.classList.add('shake');
      setTimeout(() => captcha.classList.remove('shake'), 400);
      ok = false;
    }
    return ok;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) {
      toast('Confere os campos destacados', 'error');
      return;
    }
    try {
      localStorage.setItem('ponte_auth', JSON.stringify({
        email: email.value.trim(),
        senha: senha.value
      }));
    } catch {}
    progressFill.style.width = '65%';
    toast('Autenticado! Indo para formações…', 'success');
    setTimeout(() => { window.location.href = 'formacoes.html'; }, 700);
  });

  $('#prevBtn').addEventListener('click', () => {
    // Volta para a tela 1, se existir
    window.location.href = 'index.html';
  });
})();
