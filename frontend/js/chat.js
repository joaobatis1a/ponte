/* =========================================================
   Manguelito — Cadastro Dinâmico via Chat (offline)
   Engenharia de prompt: mentor amigável que extrai entidades
   estruturadas de conversa informal.
   Captura obrigatória: Nome+Sobrenome, Idade, Bairro (RMR),
   Experiências Informais. Formação é opcional.
   Tempo de resposta simulado: < 10s (1.2s a 2.2s)
   ========================================================= */

(() => {
  'use strict';

  // ---------- Elementos ----------
  const stream = document.getElementById('chatStream');
  const form = document.getElementById('composer');
  const input = document.getElementById('msgInput');
  const sendBtn = document.getElementById('sendBtn');
  const chipsEl = document.getElementById('chips');
  const statusText = document.getElementById('statusText');
  const progressFill = document.getElementById('progressFill');
  const progressBar = document.getElementById('progressBar');
  const btnBack = document.getElementById('btnBack');
  const btnClose = document.getElementById('btnClose');
  const toastEl = document.getElementById('toast');

  // ---------- Estado ----------
  /** Entidades extraídas */
  const data = {
    nome: '',
    sobrenome: '',
    idade: null,
    bairro: '',
    experiencias: [],
    formacoes: [], // { instituicao, cidade, curso, inicio, fim }
  };

  // Etapas do diálogo
  const STEPS = ['saudacao', 'nome', 'idade', 'bairro', 'experiencias', 'pergunta_formacao', 'formacao_loop', 'fim'];
  let stepIdx = 0;

  // Sub-estado para formação
  let formacaoBuffer = null;
  let formacaoSubStep = 0; // 0 instituicao, 1 cidade, 2 curso, 3 datas

  // ---------- Bairros RMR (Região Metropolitana do Recife) ----------
  const BAIRROS_RMR = [
    'boa viagem','pina','imbiribeira','ipsep','setúbal','setubal','candeias','piedade','jaboatão','jaboatao',
    'olinda','rio doce','casa caiada','peixinhos','bairro novo','jardim atlântico','jardim atlantico',
    'casa amarela','espinheiro','graças','gracas','aflitos','torre','madalena','iputinga','várzea','varzea',
    'cordeiro','san martin','afogados','torrões','torroes','san josé','san jose','santo amaro','recife antigo',
    'boa vista','derby','ilha do leite','soledade','santo antônio','santo antonio','encruzilhada','rosarinho',
    'cidade universitária','cidade universitaria','engenho do meio','curado','tejipió','tejipio','ibura','cohab',
    'paulista','abreu e lima','camaragibe','são lourenço','sao lourenco','cabo','itapissuma','igarassu','itamaracá','itamaraca'
  ];

  // ---------- Toast ----------
  function toast(msg, type) {
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toastEl.className = 'toast'; }, 2600);
  }

  // ---------- Render mensagens ----------
  function nowHM() {
    const d = new Date();
    return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }

  function addRow(side, html, opts = {}) {
    const row = document.createElement('div');
    row.className = 'row ' + side;

    if (side === 'bot') {
      const av = document.createElement('div');
      av.className = 'row-avatar';
      av.innerHTML = '<img src="logo-1.png" alt="" />';
      row.appendChild(av);
    }

    const bub = document.createElement('div');
    bub.className = 'bubble';
    bub.innerHTML = html + (opts.noTime ? '' : `<span class="meta">${nowHM()}</span>`);
    row.appendChild(bub);

    stream.appendChild(row);
    requestAnimationFrame(() => { stream.scrollTop = stream.scrollHeight; });
    return row;
  }

  function showTyping() {
    statusText.textContent = 'digitando…';
    const row = document.createElement('div');
    row.className = 'row bot';
    row.id = '__typing';
    row.innerHTML = `
      <div class="row-avatar"><img src="logo-1.png" alt="" /></div>
      <div class="bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
    stream.appendChild(row);
    stream.scrollTop = stream.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById('__typing');
    if (t) t.remove();
    statusText.textContent = 'online · pronto pra te conhecer';
  }

  // Envia mensagem do bot com delay (simula tempo de resposta < 10s)
  function botSay(text, opts = {}) {
    return new Promise((resolve) => {
      showTyping();
      // delay realista: 1.2s a 2.2s (bem abaixo do limite de 10s)
      const delay = 1200 + Math.random() * 1000;
      setTimeout(() => {
        hideTyping();
        addRow('bot', text);
        if (opts.chips) renderChips(opts.chips);
        resolve();
      }, delay);
    });
  }

  // Sequência de mensagens do bot
  async function botSayMany(messages) {
    for (const m of messages) {
      const txt = typeof m === 'string' ? m : m.text;
      const opts = typeof m === 'string' ? {} : m;
      await botSay(txt, opts);
    }
  }

  // ---------- Chips ----------
  function renderChips(items) {
    clearChips();
    if (!items || !items.length) return;
    items.forEach((label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.textContent = label;
      btn.onclick = () => {
        clearChips();
        handleUserInput(label);
      };
      chipsEl.appendChild(btn);
    });
    chipsEl.hidden = false;
  }
  function clearChips() {
    chipsEl.innerHTML = '';
    chipsEl.hidden = true;
  }

  // ---------- Progresso ----------
  function setProgress(pct) {
    pct = Math.max(0, Math.min(100, pct));
    progressFill.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  // ---------- Extração de entidades (heurística leve, em PT-BR) ----------
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();

  function extractName(text) {
    // remove apresentações comuns
    let t = text.trim()
      .replace(/^(oi|ola|olá|eai|e ai|opa|hey|hi|hello)[\s,!.]*/i, '')
      .replace(/^(meu nome (e|é)|me chamo|sou (o|a)|eu sou|sou)\s+/i, '')
      .replace(/[.!?]+$/,'')
      .trim();
    // pega só as 2-4 primeiras palavras alfabéticas
    const partes = t.split(/\s+/).filter(p => /^[A-Za-zÀ-ÿ'\-]{2,}$/.test(p)).slice(0, 4);
    if (partes.length < 2) return null;
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    return {
      nome: cap(partes[0]),
      sobrenome: partes.slice(1).map(cap).join(' '),
    };
  }

  function extractIdade(text) {
    // padrões: "tenho 17 anos", "17", "17 aninhos", "dezessete"
    const m = text.match(/(\b\d{1,2}\b)/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 10 && n <= 80) return n;
    }
    const tabela = {
      'dez':10,'onze':11,'doze':12,'treze':13,'quatorze':14,'catorze':14,'quinze':15,
      'dezesseis':16,'dezessete':17,'dezoito':18,'dezenove':19,'vinte':20,
      'vinte e um':21,'vinte e dois':22,'vinte e tres':23,'vinte e três':23,
      'vinte e quatro':24,'vinte e cinco':25
    };
    const n = norm(text);
    for (const k of Object.keys(tabela).sort((a,b)=>b.length-a.length)) {
      if (n.includes(k)) return tabela[k];
    }
    return null;
  }

  function extractBairro(text) {
    const n = norm(text);
    // tenta encontrar bairro conhecido
    const found = BAIRROS_RMR.find(b => n.includes(b));
    if (found) {
      return found.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    // se não, aceita texto curto como bairro informado
    let t = text.trim().replace(/^(moro (no|na|em)|sou (do|da)|fico (no|na))\s+/i, '');
    t = t.replace(/[.!?]+$/,'').trim();
    if (t.length >= 3 && t.length <= 40) {
      return t.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    return null;
  }

  function extractExperiencias(text) {
    // separa por vírgula, "e", ponto-e-vírgula, quebras
    const partes = text.split(/[,;]|\s+e\s+|\n/i)
      .map(s => s.trim())
      .filter(s => s.length >= 3 && s.length <= 120);
    return partes.length ? partes : [text.trim()].filter(s => s.length >= 3);
  }

  function isAffirmative(text) {
    return /^\s*(sim|s|claro|com certeza|bora|vamo|vamos|positivo|yep|yes|aham|uhum)\b/i.test(text);
  }
  function isNegative(text) {
    return /^\s*(n[aã]o|nao|nada|nope|negativo|nem|n)\b/i.test(text);
  }

  function extractDataMMAAAA(text) {
    // procura padrões MM/AAAA, MM-AAAA, MM.AAAA, ou "março de 2023"
    const m = text.match(/(\b0?[1-9]|1[0-2])[\/\-.](\d{4})/);
    if (m) {
      const mm = String(parseInt(m[1],10)).padStart(2,'0');
      return mm + '/' + m[2];
    }
    const meses = {janeiro:'01',fevereiro:'02',marco:'03',março:'03',abril:'04',maio:'05',junho:'06',julho:'07',agosto:'08',setembro:'09',outubro:'10',novembro:'11',dezembro:'12'};
    const n = norm(text);
    for (const [k,v] of Object.entries(meses)) {
      if (n.includes(k)) {
        const ano = (text.match(/(\d{4})/) || [])[1];
        if (ano) return v + '/' + ano;
      }
    }
    return null;
  }

  function extractInicioFim(text) {
    // ex: "03/2022 a 12/2023" / "março de 2022 até dezembro 2023"
    const matches = [...text.matchAll(/(\b0?[1-9]|1[0-2])[\/\-.](\d{4})/g)];
    if (matches.length >= 2) {
      const fmt = (m) => String(parseInt(m[1],10)).padStart(2,'0') + '/' + m[2];
      return { inicio: fmt(matches[0]), fim: fmt(matches[1]) };
    }
    return null;
  }

  // ---------- Card resumo ----------
  function renderSummaryCard() {
    const exp = data.experiencias.length ? data.experiencias.join(' · ') : '—';
    const forms = data.formacoes.length
      ? data.formacoes.map(f => `${f.curso} (${f.instituicao}) — ${f.inicio} a ${f.fim}`).join('<br>')
      : '<i style="opacity:.6">Nenhuma informada</i>';

    const html = `
      <div class="summary-card">
        <h3>✨ Cadastro capturado</h3>
        <ul>
          <li><b>Nome</b><span>${data.nome} ${data.sobrenome}</span></li>
          <li><b>Idade</b><span>${data.idade} anos</span></li>
          <li><b>Bairro</b><span>${data.bairro}</span></li>
          <li><b>Experiências</b><span>${exp}</span></li>
          <li><b>Formação</b><span>${forms}</span></li>
        </ul>
      </div>`;
    addRow('bot', html, { noTime: true });
  }

  // ---------- Persistência ----------
  function persist() {
    try {
      localStorage.setItem('ponte_manguelito', JSON.stringify(data));
      // compatibilidade com fluxo existente
      if (data.nome && data.sobrenome) {
        const basico = JSON.parse(localStorage.getItem('ponte_basico') || '{}');
        basico.nome = data.nome;
        basico.sobrenome = data.sobrenome;
        if (data.idade) basico.idade = data.idade;
        if (data.bairro) basico.bairro = data.bairro;
        localStorage.setItem('ponte_basico', JSON.stringify(basico));
      }
      if (data.formacoes.length) {
        localStorage.setItem('ponte_formacoes', JSON.stringify(data.formacoes));
      }
    } catch (e) { /* storage indisponível */ }
  }

  // ---------- Máquina de diálogo ----------
  async function startConversation() {
    setProgress(15);
    await botSayMany([
      'E aí! 🦀 Sou o <b>Manguelito</b>, mentor aqui da P.O.N.T.E.',
      'Bora montar teu perfil numa conversa de boa? Pode falar do teu jeito que eu vou anotando tudo. 😉',
      'Pra começar: <b>qual é teu nome completo</b>?',
    ]);
    stepIdx = STEPS.indexOf('nome');
  }

  async function handleUserInput(text) {
    if (!text || !text.trim()) return;

    // adiciona mensagem do usuário
    addRow('me', escapeHtml(text));

    const step = STEPS[stepIdx];

    if (step === 'nome') {
      const nm = extractName(text);
      if (!nm) {
        await botSay('Hmm, não peguei direito 😅. Me passa <b>nome e sobrenome</b>, tipo "<i>Maria Souza</i>".');
        return;
      }
      data.nome = nm.nome;
      data.sobrenome = nm.sobrenome;
      persist();
      setProgress(30);
      await botSay(`Show, <b>${data.nome}</b>! Prazer 🤝`);
      await botSay('E qual é a tua <b>idade</b>?');
      stepIdx = STEPS.indexOf('idade');
      return;
    }

    if (step === 'idade') {
      const idade = extractIdade(text);
      if (!idade) {
        await botSay('Manda só o número, tipo "<b>17</b>" 🙂');
        return;
      }
      data.idade = idade;
      persist();
      setProgress(45);
      await botSay(`${idade} anos, anotado! 📝`);
      await botSay('Em qual <b>bairro</b> da Região Metropolitana do Recife tu mora?');
      stepIdx = STEPS.indexOf('bairro');
      return;
    }

    if (step === 'bairro') {
      const bairro = extractBairro(text);
      if (!bairro) {
        await botSay('Não consegui identificar 🤔. Diz só o nome do bairro, ex: "<b>Boa Viagem</b>" ou "<b>Casa Amarela</b>".');
        return;
      }
      data.bairro = bairro;
      persist();
      setProgress(60);
      await botSay(`<b>${bairro}</b>, massa! 🏘️`);
      await botSayMany([
        'Agora a parte mais legal: me conta tuas <b>experiências informais</b>.',
        'Pode ser qualquer coisa que tu já fez — tipo ajudar no comércio da família, vender doce, cuidar de criança, mexer com computador, voluntariado… 💪',
        'Pode listar separando por vírgula, beleza?',
      ]);
      stepIdx = STEPS.indexOf('experiencias');
      return;
    }

    if (step === 'experiencias') {
      const exps = extractExperiencias(text);
      if (!exps.length) {
        await botSay('Bora lá, me conta pelo menos uma experiência 🙏');
        return;
      }
      data.experiencias = exps;
      persist();
      setProgress(75);
      await botSay(`Boa! Anotei <b>${exps.length}</b> experiência${exps.length>1?'s':''}: ${exps.map(e=>`"${escapeHtml(e)}"`).join(', ')}.`);
      await botSay('Tu já <b>estudou ou tá estudando</b> em algum lugar? (escola, curso técnico, faculdade…)', {
        chips: ['Sim', 'Não'],
      });
      stepIdx = STEPS.indexOf('pergunta_formacao');
      return;
    }

    if (step === 'pergunta_formacao') {
      if (isNegative(text)) {
        setProgress(95);
        await botSay('Tranquilo! Formação é opcional mesmo. 👌');
        await finishConversation();
        return;
      }
      if (isAffirmative(text)) {
        formacaoBuffer = { instituicao: '', cidade: '', curso: '', inicio: '', fim: '' };
        formacaoSubStep = 0;
        await botSay('Show! Qual o nome da <b>instituição de ensino</b>?');
        stepIdx = STEPS.indexOf('formacao_loop');
        return;
      }
      await botSay('Só responde <b>Sim</b> ou <b>Não</b> 🙂', { chips: ['Sim','Não'] });
      return;
    }

    if (step === 'formacao_loop') {
      if (formacaoSubStep === 0) {
        formacaoBuffer.instituicao = text.trim();
        formacaoSubStep = 1;
        await botSay('Em qual <b>cidade</b> fica?');
        return;
      }
      if (formacaoSubStep === 1) {
        formacaoBuffer.cidade = text.trim();
        formacaoSubStep = 2;
        await botSay('E qual o <b>tipo de curso</b>? (ex: Ensino Médio, Técnico em Informática, Inglês…)');
        return;
      }
      if (formacaoSubStep === 2) {
        formacaoBuffer.curso = text.trim();
        formacaoSubStep = 3;
        await botSay('Por último: <b>data de início e fim</b> no formato <b>MM/AAAA</b>.<br>Ex: "<i>03/2022 a 12/2023</i>" — se ainda tá cursando, manda "<i>03/2022 a atual</i>".');
        return;
      }
      if (formacaoSubStep === 3) {
        let inicio = '', fim = '';
        const ambos = extractInicioFim(text);
        if (ambos) {
          inicio = ambos.inicio;
          fim = ambos.fim;
        } else {
          inicio = extractDataMMAAAA(text) || '';
          fim = /atual|cursando|presente|hoje/i.test(text) ? 'Atual' : '';
        }
        if (!inicio) {
          await botSay('Não entendi as datas 😅. Manda no formato <b>MM/AAAA a MM/AAAA</b>, ex: "<i>03/2022 a 12/2023</i>".');
          return;
        }
        formacaoBuffer.inicio = inicio;
        formacaoBuffer.fim = fim || 'Atual';
        data.formacoes.push({ ...formacaoBuffer });
        persist();
        formacaoBuffer = null;
        formacaoSubStep = 0;
        await botSay('Anotado! ✅ Quer adicionar <b>outra formação</b>?', { chips: ['Sim','Não'] });
        stepIdx = STEPS.indexOf('pergunta_formacao');
        return;
      }
    }

    if (step === 'fim') {
      await botSay('Já fechamos teu cadastro! 🎉 Pode clicar em <b>continuar</b>.');
      return;
    }
  }

  async function finishConversation() {
    setProgress(100);
    await botSay('Pronto! Vê só o que eu capturei da nossa conversa:');
    renderSummaryCard();
    await botSay('Tá tudo certo? Se quiser ajustar algo é só me dizer. Senão, bora pro próximo passo! 🚀');
    stepIdx = STEPS.indexOf('fim');

    // botão de avançar
    const row = document.createElement('div');
    row.className = 'row bot';
    row.innerHTML = `
      <div class="row-avatar"><img src="logo-1.png" alt=""/></div>
      <div class="bubble" style="background:var(--primary);color:#fff;cursor:pointer;font-weight:800"
           onclick="window.location.href='pronto.html'">
        Avançar para revisão →
        <span class="meta" style="color:#fff;opacity:.7">${nowHM()}</span>
      </div>`;
    stream.appendChild(row);
    stream.scrollTop = stream.scrollHeight;

    toast('Cadastro salvo!', 'success');
  }

  // ---------- Util ----------
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // ---------- Eventos ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    input.value = '';
    clearChips();
    handleUserInput(v);
  });

  btnBack.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else window.location.href = 'formacoes.html';
  });
  btnClose.addEventListener('click', () => {
    if (confirm('Sair da conversa? O progresso é salvo automaticamente.')) {
      window.location.href = 'index.html';
    }
  });

  // foco automático no input em desktop
  if (window.matchMedia('(min-width: 600px)').matches) {
    setTimeout(() => input.focus(), 800);
  }

  // ---------- Bootstrap ----------
  startConversation();
})();
