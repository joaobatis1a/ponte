// pega os dados do formulário de Ana, monta o JSON e envia pro backend de Pedro
// o frontend só repassa os dados — sem validações profundas

const formSubmissao = document.getElementById('form-submissao');

formSubmissao.addEventListener('submit', async (e) => {
  e.preventDefault();

  // pega os dados direto dos campos de Ana
  const payload = {
    usuario_id:  document.getElementById('usuario-id')?.value  || '',
    desafio_id:  document.getElementById('desafio-id')?.value  || '',
    link:        document.getElementById('campo-link')?.value  || '',
    texto:       document.getElementById('campo-texto')?.value || '',
  };

  // desabilita o botão pra evitar duplo envio
  const btnEnviar = document.getElementById('btn-enviar-submissao');
  if (btnEnviar) btnEnviar.disabled = true;

  try {
    const res = await fetch('/submissao', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Erro ${res.status}`);

    mostrarFeedback('✅ Submissão enviada com sucesso!', 'sucesso');

  } catch (e) {
    const semInternet = e instanceof TypeError && e.message.includes('fetch');
    mostrarFeedback(
      semInternet
        ? '⚠️ Sem conexão. Verifica a internet e tenta de novo.'
        : '⚠️ Algo deu errado. Tenta de novo.',
      'erro'
    );
  } finally {
    // reabilita o botão independente do resultado
    if (btnEnviar) btnEnviar.disabled = false;
  }
});

// mostra o feedback na tela — usa o toast se existir, senão cria um simples
function mostrarFeedback(mensagem, tipo) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = mensagem;
    toast.className   = `toast ${tipo} visivel`;
    setTimeout(() => toast.classList.remove('visivel'), 4000);
    return;
  }

  // fallback caso não tenha toast no HTML
  alert(mensagem);
}