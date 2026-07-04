// Comportamento da tela de detalhes de uma oportunidade (vaga).
// Ainda não fala com a API real de vagas (o backend hoje só tem
// desafios) — por enquanto simula o fluxo de candidatura no front.

function mostrarToast(mensagem, tipo = "") {
  const toast = document.getElementById("toast");
  if (!toast) { alert(mensagem); return; }
  toast.textContent = mensagem;
  toast.className = `toast show ${tipo}`;
  setTimeout(() => { toast.className = "toast"; }, 3200);
}

const btnSave = document.getElementById('btn-save');
if (btnSave) {
  btnSave.addEventListener('click', () => {
    const salvo = btnSave.classList.toggle('saved');
    mostrarToast(salvo ? "Vaga salva no seu perfil!" : "Vaga removida dos salvos.", "success");
  });
}

const btnCandidatar = document.getElementById('btn-candidatar');
if (btnCandidatar) {
  btnCandidatar.addEventListener('click', () => {
    btnCandidatar.disabled = true;
    btnCandidatar.textContent = 'Enviando candidatura...';
    setTimeout(() => {
      btnCandidatar.innerHTML = `
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
        Candidatura enviada
      `;
      mostrarToast("Candidatura enviada! A empresa vai receber teu perfil e teu Ponte Pass.", "success");
    }, 900);
  });
}
