(() => {
  'use strict';

  // --- Elementos da Interface ---
  const stream = document.getElementById('chatStream');
  const form = document.getElementById('composer');
  const input = document.getElementById('msgInput');
  const statusText = document.getElementById('statusText');
  const btnBack = document.getElementById('btnBack');
  const btnClose = document.getElementById('btnClose');
  const toastEl = document.getElementById('toast');

  // URL do Backend do Pedro (Ajuste a porta/URL conforme o ambiente de vocês)
  const API_CHAT_URL = 'http://127.0.0.1:8000/chat/mensagem';

  // --- Funções de UI ---
  function nowHM() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function addRow(side, text) {
    const row = document.createElement('div');
    row.className = `row ${side}`;

    if (side === 'bot') {
      const av = document.createElement('div');
      av.className = 'row-avatar';
      av.innerHTML = '<img src="assets/logo-1.png" alt="Manguelito" />';
      row.appendChild(av);
    }

    const bub = document.createElement('div');
    bub.className = 'bubble';
    bub.innerHTML = `${text} <span class="meta">${nowHM()}</span>`;
    row.appendChild(bub);

    stream.appendChild(row);
    stream.scrollTop = stream.scrollHeight;
  }

  function showTyping() {
    statusText.textContent = 'digitando…';
    const row = document.createElement('div');
    row.className = 'row bot';
    row.id = '__typing';
    row.innerHTML = `
      <div class="row-avatar"><img src="assets/logo-1.png" alt="" /></div>
      <div class="bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
    stream.appendChild(row);
    stream.scrollTop = stream.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('__typing');
    if (t) t.remove();
    statusText.textContent = 'online · pronto pra te conhecer';
  }

  function toast(msg, type = '') {
    toastEl.textContent = msg;
    toastEl.className = `toast show ${type}`;
    setTimeout(() => { toastEl.className = 'toast'; }, 3000);
  }

  // --- O Cérebro Real (Comunicação com teu Backend Python) ---
  async function sendMessageToBackend(userMessage) {
    try {
      showTyping();
      
      const response = await fetch(API_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mensagem: userMessage,
          jovem_id: localStorage.getItem('ponte_jovem_id') 
        })
      });

      if (!response.ok) throw new Error('Falha no servidor');

      const data = await response.json();
      hideTyping();
      
      addRow('bot', data.resposta || "Oxe, minha antena falhou. Pode repetir?");

      if (data.finalizar_conversa === true) {
          console.log("[Chat-Debug] Conversa finalizada pela IA. Redirecionando para o Feed...");
          
          input.disabled = true;
          document.getElementById('sendBtn').disabled = true;
          
          toast('Perfil atualizado com sucesso!', 'success');

          setTimeout(() => {
              window.location.href = 'feed.html';
          }, 3500);
      }

    } catch (error) {
      console.error("[Chat] Erro na requisição:", error);
      hideTyping();
      addRow('bot', "Eita gota serena, tô sem sinal com a central! Tenta de novo visse?");
      toast('Erro de conexão com o servidor.', 'error');
    }
  }

  // --- Eventos ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    input.value = ''; // limpa input
    addRow('me', text); // joga na tela lado direito
    sendMessageToBackend(text); // Manda pro Pedro se virar
  });

  btnBack.addEventListener('click', () => history.back());
  btnClose.addEventListener('click', () => {
    if (confirm('Sair da conversa? O progresso salvo continua no teu perfil.')) {
      window.location.href = 'index.html';
    }
  });

  // Mensagem inicial do Manguelito
  setTimeout(() => {
    addRow('bot', 'Opa, mestre! Sou o Manguelito. Me conta aí, quais experiências e correrias tu já fez na vida? Pode falar do teu jeito 🦀');
  }, 800);

})();