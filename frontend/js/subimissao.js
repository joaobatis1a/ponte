const formSubmissao = document.getElementById('form-submissao');

const API_SUBMISSAO_URL = 'http://127.0.0.1:8000/feed/submissao';

formSubmissao.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    jovem_id:     document.getElementById('usuario-id')?.value  || '',
    desafio_id:   document.getElementById('desafio-id')?.value  || '',
    link_externo: document.getElementById('campo-link')?.value  || null,
    descricao:    document.getElementById('campo-texto')?.value || '',
  };
  console.log("\n[Submissao-Debug] Disparando POST com o payload:", JSON.stringify(payload));

  const btnEnviar = document.getElementById('btn-enviar-submissao');
  if (btnEnviar) btnEnviar.disabled = true;

  try {
    const res = await fetch(API_SUBMISSAO_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Erro ${res.status}`);
    }

    mostrarFeedback('✅ Submissão enviada com sucesso!', 'sucesso');
    formSubmissao.reset();

  } catch (e) {
    const semInternet = e instanceof TypeError && e.message.includes('fetch');
    mostrarFeedback(
      semInternet
        ? '⚠️ Sem conexão. Verifica a internet e tenta de novo.'
        : `⚠️ Algo deu errado: ${e.message}`,
      'erro'
    );
  } finally {
    if (btnEnviar) btnEnviar.disabled = false;
  }
});

function mostrarFeedback(mensagem, tipo) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = mensagem;
    toast.className   = `toast ${tipo} visivel`;
    setTimeout(() => toast.classList.remove('visivel'), 4000);
    return;
  }
  alert(mensagem);
}