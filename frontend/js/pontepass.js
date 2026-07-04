// Comportamento da tela do Ponte Pass (carteirinha digital).
// Hoje mostra dados de exemplo; quando a rota GET /profile/{jovem_id}
// já retornar habilidades e emblemas, basta trocar esses valores fixos
// pelo resultado do fetch.

function mostrarToast(mensagem, tipo = "") {
  const toast = document.getElementById("toast");
  if (!toast) { alert(mensagem); return; }
  toast.textContent = mensagem;
  toast.className = `toast show ${tipo}`;
  setTimeout(() => { toast.className = "toast"; }, 3200);
}

const btnShare = document.getElementById('btn-share-pass');
if (btnShare) {
  btnShare.addEventListener('click', async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Meu Ponte Pass', url });
      } else {
        await navigator.clipboard.writeText(url);
        mostrarToast("Link do teu Ponte Pass copiado!", "success");
      }
    } catch (e) {
      mostrarToast("Não deu pra compartilhar agora, tenta de novo.");
    }
  });
}
