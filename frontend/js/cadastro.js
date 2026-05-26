//const INSTITUICOES = ["ETE - Porto Digital","UNIFAFIRE","UNINASSAU","UNIBRA","UFPR","UFPE","UFRPE","UPE","CESAR School","IFPE","UNICAP","Outra"];
//const CIDADES = ["Recife","Olinda","Igarassu","Abreu e Lima","Jaboatão dos Guararapes","Caruaru","Petrolina","Paulista","Outra"];
//const CURSOS = ["Ensino Médio","Análise e Desenvolvimento de Sistemas","Técnico em Informática","Técnico em Redes de Computadores","Ciencias da Computação","Sistemas para Internet","Técnico em Administração","Direito","Letras","Engenharia","Design","Outro"];
const STEP_PROGRESS = [15, 40, 65, 100];

const state = {
  step: 0,
  basico: { nome: "", sobrenome: "", nascimento: "", cep: "" },
  foto: "",
  auth: { email: "", senha: "" },
  confirmar: "",
  robot: false,
  showSenha: false,
  showConfirmar: false,
  formacoes: [],
  draft: { instituicao: "", cidade: "", curso: "", inicio: "", fim: "" },
  errors: {}
};

const $ = (s, r=document) => r.querySelector(s);
const root = $('#stepRoot');
const progressBar = $('#progressBar');
const toastEl = $('#toast');
let toastTimer = null;

function showToast(msg, type) {
  toastEl.textContent = msg;
  toastEl.className = 'toast show' + (type ? ' ' + type : '');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.className = 'toast', 2800);
}

function maskDate(v) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return d.slice(0,2) + '/' + d.slice(2);
  return d.slice(0,2) + '/' + d.slice(2,4) + '/' + d.slice(4);
}
function maskShortDate(v) {
  const d = v.replace(/\D/g, '').slice(0, 6);
  if (d.length <= 2) return d;
  if (d.length <= 4) return d.slice(0,2) + '/' + d.slice(2);
  return d.slice(0,2) + '/' + d.slice(2,4) + '/' + d.slice(4);
}
function maskCEP(v) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length <= 5 ? d : d.slice(0,5) + '-' + d.slice(5);
}
function isValidShortDate(v) {
  if (!/^\d{2}\/\d{2}\/\d{2}$/.test(v)) return false;
  const [d,m,y] = v.split('/').map(Number);
  if (m < 1 || m > 12) return false;
  const dim = new Date(2000+y, m, 0).getDate();
  return d >= 1 && d <= dim;
}
function parseShortDate(v) {
  const [d,m,y] = v.split('/').map(Number);
  return new Date(2000+y, m-1, d);
}

function validateBasico() {
  const e = {};
  const b = state.basico;
  if (!b.nome.trim()) e.nome = 'Informe teu nome';
  else if (b.nome.length > 60) e.nome = 'Máx. 60 caracteres';
  if (!b.sobrenome.trim()) e.sobrenome = 'Informe teu sobrenome';
  const m = b.nascimento.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) e.nascimento = 'Use DD/MM/AAAA';
  else {
    const day=+m[1], month=+m[2], year=+m[3];
    const d = new Date(year, month-1, day);
    const ok = d.getFullYear()===year && d.getMonth()===month-1 && d.getDate()===day;
    if (!ok) e.nascimento = 'Data inválida';
    else if (d > new Date()) e.nascimento = 'Data no futuro';
    else if (year < 1900) e.nascimento = 'Ano inválido';
  }
  if (!/^\d{5}-\d{3}$/.test(b.cep)) e.cep = 'Use 00000-000';
  return e;
}
function validateAuth() {
  const e = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.auth.email)) e.email = 'Email inválido';
  if (state.auth.senha.length < 8) e.senha = 'Mínimo 8 caracteres';
  else if (!/[A-Za-z]/.test(state.auth.senha) || !/\d/.test(state.auth.senha)) e.senha = 'Use letras e números';
  if (state.confirmar !== state.auth.senha) e.confirmar = 'As senhas não conferem';
  if (!state.robot) e.captcha = 'Confirme que não é um robô';
  return e;
}
function validateFormacaoDraft() {
  const e = {};
  const d = state.draft;
  if (!d.instituicao) e.instituicao = 'Selecione a instituição.';
  if (!d.cidade) e.cidade = 'Selecione a cidade.';
  if (!d.curso) e.curso = 'Selecione o curso.';
  if (!d.inicio) e.inicio = 'Informe o início.';
  else if (!isValidShortDate(d.inicio)) e.inicio = 'Data inválida.';
  if (d.fim && !isValidShortDate(d.fim)) e.fim = 'Data inválida.';
  if (!e.inicio && !e.fim && d.fim) {
    if (parseShortDate(d.fim) < parseShortDate(d.inicio)) e.fim = 'Fim antes do início.';
  }
  return e;
}
function strength(s) {
  let v = 0;
  if (s.length >= 8) v++;
  if (/[A-Z]/.test(s)) v++;
  if (/\d/.test(s)) v++;
  if (/[^A-Za-z0-9]/.test(s)) v++;
  return v;
}

function handleNext() {
  console.log(`[Cadastro-Debug] Botão 'Próximo' clicado. Step atual: ${state.step}`);

  if (state.step === 0) {
    state.errors = validateBasico();
    if (Object.keys(state.errors).length) { 
      console.warn('[Cadastro-Debug] Erro na validação básica:', state.errors);
      render(); return showToast('Confere os campos destacados', 'error'); 
    }
    state.step = 1; state.errors = {};
    console.log('[Cadastro-Debug] Avançou para Step 1');
  } 
  else if (state.step === 1) {
    state.errors = validateAuth();
    if (Object.keys(state.errors).length) { 
      console.warn('[Cadastro-Debug] Erro na validação auth:', state.errors);
      render(); return showToast('Confere os campos destacados', 'error'); 
    }
    state.step = 2; state.errors = {};
    console.log('[Cadastro-Debug] Avançou para Step 2');
  } 
  else if (state.step === 2) {
    const d = state.draft;
    const algum = d.instituicao || d.cidade || d.curso || d.inicio || d.fim;
    if (algum) {
      state.errors = validateFormacaoDraft();
      if (Object.keys(state.errors).length) { 
        console.warn('[Cadastro-Debug] Erro no draft de formação:', state.errors);
        render(); return showToast('Preencha corretamente ou limpe os campos.', 'error'); 
      }
      state.formacoes.push({...d});
      console.log('[Cadastro-Debug] Formação salva no draft:', d);
      state.draft = { instituicao:'', cidade:'', curso:'', inicio:'', fim:'' };
    }
    state.step = 3; state.errors = {};
    console.log('[Cadastro-Debug] Avançou para Step 3 (Revisão final)');
  } 
  else {
    // ESTE É O MOMENTO DA VERDADE
    console.log('\n[Cadastro-Debug] SOLICITANDO ENVIO FINAL!');
    
    if(window.PONTE && window.PONTE.enviar) {
      console.log('[Cadastro-Debug] Objeto window.PONTE encontrado. Repassando state...');
      window.PONTE.enviar(state);
    } else {
      console.error('[Cadastro-Debug] ERRO FATAL: window.PONTE não existe! O arquivo api.js não carregou direito.');
      alert('ERRO: API não carregada. Pressione Ctrl+F5 e tente novamente.');
    }
    return; // Para não rodar o render() atoa
  }
  render();
}

function handlePrev() {
  if (state.step === 0) return showToast('Já estamos no início 🙂');
  state.step--;
  state.errors = {};
  render();
}
function addFormacao() {
  state.errors = validateFormacaoDraft();
  if (Object.keys(state.errors).length) { render(); return showToast('Preencha os campos corretamente.', 'error'); }
  state.formacoes.push({...state.draft});
  state.draft = { instituicao:'', cidade:'', curso:'', inicio:'', fim:'' };
  render();
  showToast('Formação adicionada!', 'success');
}

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function actionsHTML() {
  return `<div class="actions">
    <button type="button" class="btn" data-action="prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>Anterior</button>
    <button type="submit" class="btn">Próximo<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
  </div>`;
}

function eyeIcon(visible) {
  return visible
    ? '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>'
    : '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.77 21.77 0 0 1 5.17-6.17"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/><path d="M1 1l22 22"/></svg>';
}

function renderStep0() {
  const e = state.errors, b = state.basico;
  return `
    <h1 class="title">Vamo começar<br/>com o <span class="accent">básico</span>.</h1>
    <p class="subtitle">Passa tuas informações principais pra a gente começar a montar teu perfil.</p>
    <form id="form0">
      <div class="field">
        <label for="nome">Nome</label>
        <input id="nome" type="text" placeholder="Ex.: Reginaldo" value="${esc(b.nome)}" class="${e.nome?'invalid':''}" data-bind="basico.nome" />
        <p class="error">${esc(e.nome||'')}</p>
      </div>
      <div class="field">
        <label for="sobrenome">Sobrenome</label>
        <input id="sobrenome" type="text" placeholder="Ex.: Rossi" value="${esc(b.sobrenome)}" class="${e.sobrenome?'invalid':''}" data-bind="basico.sobrenome" />
        <p class="error">${esc(e.sobrenome||'')}</p>
      </div>
      <div class="row">
        <div class="photo-col">
          <button type="button" class="photo-btn" id="photoBtn" aria-label="Adicionar foto">
            ${state.foto ? `<img src="${state.foto}" alt="" />` : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'}
          </button>
          <input type="file" accept="image/*" id="photoInput" hidden />
          <span class="photo-label">Foto de Perfil</span>
        </div>
        <div class="right-col">
          <div class="field">
            <label for="nascimento">Data de Nascimento</label>
            <input id="nascimento" type="text" inputmode="numeric" placeholder="DD/MM/AAAA" value="${esc(b.nascimento)}" class="${e.nascimento?'invalid':''}" data-bind="basico.nascimento" data-mask="date" />
            <p class="error">${esc(e.nascimento||'')}</p>
          </div>
          <div class="field">
            <label for="cep">CEP</label>
            <input id="cep" type="text" inputmode="numeric" placeholder="Ex.: 12345-678" value="${esc(b.cep)}" class="${e.cep?'invalid':''}" data-bind="basico.cep" data-mask="cep" />
            <p class="error">${esc(e.cep||'')}</p>
          </div>
        </div>
      </div>
      ${actionsHTML()}
    </form>`;
}

function renderStep1() {
  const e = state.errors;
  const sStr = strength(state.auth.senha);
  const labels = ['Muito fraca','Fraca','Média','Forte','Excelente'];
  const colors = ['#c0392b','#c0392b','#e8632b','#2e7d32','#2e7d32'];
  return `
    <h1 class="title">Agora vamo de<br/><span class="accent">autenticação</span>.</h1>
    <p class="subtitle">Lembre-se de confirmar seu email assim que terminar o cadastro.</p>
    <form id="form1">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" type="email" placeholder="Ex.: exemplo@email.com" value="${esc(state.auth.email)}" class="${e.email?'invalid':''}" data-bind="auth.email" />
        <p class="error">${esc(e.email||'')}</p>
      </div>
      <div class="field">
        <label for="senha">Senha</label>
        <div class="password-wrap">
          <input id="senha" type="${state.showSenha?'text':'password'}" placeholder="Mín. 8 letras e números" value="${esc(state.auth.senha)}" class="${e.senha?'invalid':''}" data-bind="auth.senha" />
          <button type="button" class="eye" data-toggle="senha" aria-label="Mostrar senha">${eyeIcon(state.showSenha)}</button>
        </div>
        ${state.auth.senha ? `<div class="strength"><div class="strength-bar"><span style="width:${(sStr/4)*100}%;background:${colors[sStr]}"></span></div><span class="strength-label">${labels[sStr]}</span></div>` : ''}
        <p class="error">${esc(e.senha||'')}</p>
      </div>
      <div class="field">
        <label for="confirmar">Confirmar Senha</label>
        <div class="password-wrap">
          <input id="confirmar" type="${state.showConfirmar?'text':'password'}" placeholder="Mesma senha" value="${esc(state.confirmar)}" class="${e.confirmar?'invalid':''}" data-bind="confirmar" />
          <button type="button" class="eye" data-toggle="confirmar" aria-label="Mostrar senha">${eyeIcon(state.showConfirmar)}</button>
        </div>
        <p class="error">${esc(e.confirmar||'')}</p>
      </div>
      <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-weight:700;font-size:14px">
        <input type="checkbox" id="robot" ${state.robot?'checked':''} /> Não sou um robô
      </label>
      <p class="error">${esc(e.captcha||'')}</p>
      ${actionsHTML()}
    </form>`;
}

function renderStep2() {
  const e = state.errors, d = state.draft;
  
  return `
    <h1 class="title">Conta sobre<br/>tuas <span class="accent">formações</span>.</h1>
    <p class="subtitle">Insira escola e/ou faculdade. Não é obrigatório se tu não tiver!</p>
    <form id="form2">
      <div class="field">
        <label for="instituicao">Instituição</label>
        <input id="instituicao" type="text" placeholder="Ex.: ETE Porto Digital, UFPE..." 
               value="${esc(d.instituicao)}" class="${e.instituicao?'invalid':''}" 
               data-bind="draft.instituicao" />
        <p class="error">${esc(e.instituicao||'')}</p>
      </div>

      <div class="field">
        <label for="cidade">Cidade</label>
        <input id="cidade" type="text" placeholder="Ex.: Recife, Olinda..." 
               value="${esc(d.cidade)}" class="${e.cidade?'invalid':''}" 
               data-bind="draft.cidade" />
        <p class="error">${esc(e.cidade||'')}</p>
      </div>

      <div class="field">
        <label for="curso">Curso</label>
        <input id="curso" type="text" placeholder="Ex.: Técnico em Informática, Design..." 
               value="${esc(d.curso)}" class="${e.curso?'invalid':''}" 
               data-bind="draft.curso" />
        <p class="error">${esc(e.curso||'')}</p>
      </div>

      <div class="two-cols">
        <div class="field">
          <label for="inicio">Início</label>
          <input id="inicio" type="text" inputmode="numeric" placeholder="DD/MM/AA" 
                 maxlength="8" value="${esc(d.inicio)}" class="${e.inicio?'invalid':''}" 
                 data-bind="draft.inicio" data-mask="short" />
          <p class="error">${esc(e.inicio||'')}</p>
        </div>
        <div class="field">
          <label for="fim">Fim</label>
          <input id="fim" type="text" inputmode="numeric" placeholder="DD/MM/AA" 
                 maxlength="8" value="${esc(d.fim)}" class="${e.fim?'invalid':''}" 
                 data-bind="draft.fim" data-mask="short" />
          <p class="error">${esc(e.fim||'')}</p>
        </div>
      </div>

      <button type="button" class="btn btn-outline" id="addFormacao">Adicionar Formação +</button>
      
      <div class="formacoes-list">
        ${state.formacoes.map((f,i) => `
          <div class="formacao-item">
            <div class="formacao-item-info">
              <p class="formacao-item-title">${esc(f.curso)} — ${esc(f.instituicao)}</p>
              <p class="formacao-item-meta">${esc(f.cidade)} · ${esc(f.inicio)}${f.fim?' até '+esc(f.fim):' · cursando'}</p>
            </div>
            <button type="button" aria-label="Remover" data-remove="${i}">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/>
              </svg>
            </button>
          </div>`).join('')}
      </div>
      ${actionsHTML()}
    </form>`;
}

function renderStep3() {
  const b = state.basico;
  const fullName = [b.nome, b.sobrenome].filter(Boolean).join(' ') || '—';
  const senhaDots = state.auth.senha ? '•'.repeat(Math.min(state.auth.senha.length, 10)) : '—';
  return `
    <h1 class="title">Cadastro <span class="accent">pronto</span>!</h1>
    <p class="subtitle">Revise suas informações e prossiga para a conversa com o Manguelito.</p>
    <div class="review-card">
      <div class="review-photo">
        ${state.foto ? `<img src="${state.foto}" alt="Foto de perfil" />` : '<div class="ph"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'}
        <div>
          <p class="name">${esc(fullName)}</p>
          <p class="sub">${esc(state.auth.email||'sem email cadastrado')}</p>
        </div>
      </div>
      <div class="review-section">
        <div class="section-header"><h3>Dados pessoais</h3><button type="button" class="edit-link" data-goto="0">Editar</button></div>
        <div class="review-row"><span class="k">Nascimento</span><span class="v">${esc(b.nascimento||'—')}</span></div>
        <div class="review-row"><span class="k">CEP</span><span class="v">${esc(b.cep||'—')}</span></div>
      </div>
      <div class="review-section">
        <div class="section-header"><h3>Autenticação</h3><button type="button" class="edit-link" data-goto="1">Editar</button></div>
        <div class="review-row"><span class="k">Email</span><span class="v">${esc(state.auth.email||'—')}</span></div>
        <div class="review-row"><span class="k">Senha</span><span class="v">${senhaDots}</span></div>
      </div>
      <div class="review-section">
        <div class="section-header"><h3>Formações</h3><button type="button" class="edit-link" data-goto="2">Editar</button></div>
        ${state.formacoes.length ? `<div class="review-list">${state.formacoes.map(f => `<div class="item"><p class="t">${esc(f.curso)} — ${esc(f.instituicao)}</p><p class="m">${esc(f.cidade)} · ${esc(f.inicio)}${f.fim?' até '+esc(f.fim):' · cursando'}</p></div>`).join('')}</div>` : '<p class="review-empty">Nenhuma formação adicionada.</p>'}
      </div>
    </div>
    <div class="actions">
      <button type="button" class="btn" data-action="prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>Anterior</button>
      <button type="button" class="btn" data-action="next">Próximo<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
    </div>`;
}

function setStateField(path, value) {
  const parts = path.split('.');
  let o = state;
  for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
  o[parts[parts.length - 1]] = value;
  if (state.errors[parts[parts.length - 1]]) {
    delete state.errors[parts[parts.length - 1]];
  }
}

function bindEvents() {
  root.querySelectorAll('[data-bind]').forEach(el => {
    el.addEventListener('input', (ev) => {
      let v = ev.target.value;
      const mask = ev.target.dataset.mask;
      if (mask === 'date') v = maskDate(v);
      else if (mask === 'short') v = maskShortDate(v);
      else if (mask === 'cep') v = maskCEP(v);
      if (v !== ev.target.value) ev.target.value = v;
      setStateField(ev.target.dataset.bind, v);
      // live update strength bar without full re-render
      if (ev.target.id === 'senha') {
        const wrap = ev.target.closest('.field');
        // simple: re-render just for feedback
        render();
        const focused = document.getElementById('senha');
        if (focused) { focused.focus(); focused.setSelectionRange(focused.value.length, focused.value.length); }
      }
    });
  });
  const form = root.querySelector('form');
  if (form) form.addEventListener('submit', (e) => { e.preventDefault(); handleNext(); });
  root.querySelectorAll('[data-action="prev"]').forEach(b => b.addEventListener('click', handlePrev));
  root.querySelectorAll('[data-action="next"]').forEach(b => b.addEventListener('click', handleNext));
  root.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.toggle === 'senha' ? 'showSenha' : 'showConfirmar';
    state[k] = !state[k]; render();
  }));
  root.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => {
    state.step = +b.dataset.goto; state.errors = {}; render();
  }));
  root.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
    state.formacoes.splice(+b.dataset.remove, 1); render();
  }));
  const addBtn = root.querySelector('#addFormacao');
  if (addBtn) addBtn.addEventListener('click', addFormacao);
  const robot = root.querySelector('#robot');
  if (robot) robot.addEventListener('change', (e) => { state.robot = e.target.checked; if (state.errors.captcha) delete state.errors.captcha; render(); });
  const photoBtn = root.querySelector('#photoBtn');
  const photoInput = root.querySelector('#photoInput');
  if (photoBtn && photoInput) {
    photoBtn.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) return showToast('Selecione uma imagem válida', 'error');
      if (file.size > 4*1024*1024) return showToast('Imagem muito grande (máx. 4MB)', 'error');
      const r = new FileReader();
      r.onload = () => { state.foto = String(r.result); render(); };
      r.readAsDataURL(file);
    });
  }
}

function render() {
  progressBar.style.width = STEP_PROGRESS[state.step] + '%';
  if (state.step === 0) root.innerHTML = renderStep0();
  else if (state.step === 1) root.innerHTML = renderStep1();
  else if (state.step === 2) root.innerHTML = renderStep2();
  else root.innerHTML = renderStep3();
  bindEvents();
}

document.querySelectorAll('[data-toast]').forEach(el => {
  el.addEventListener('click', () => showToast(el.dataset.toast));
});

render();