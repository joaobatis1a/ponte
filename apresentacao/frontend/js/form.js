const TOTAL_STEPS = 4;
let stepAtual = 1;

// vai acumulando os dados conforme o usuário avança nas telas
let dadosFormulario = {
  timestamp:              "",
  nome:                   "",
  sobrenome:              "",
  idade:                  "",
  bairro:                 "",
  experiencias_informais: "",
  instituicao:            "",
  cidade_curso:           "",
  tipo_curso:             "",
  data_inicio:            "",
  data_fim:               "",
  contato:                ""
};

function irParaStep(numero) {
  const etapaAtualEl = document.getElementById(`step-${stepAtual}`);
  if (etapaAtualEl) etapaAtualEl.classList.add("hidden");

  stepAtual = numero;

  const proximaEtapaEl = document.getElementById(`step-${stepAtual}`);
  if (proximaEtapaEl) proximaEtapaEl.classList.remove("hidden");

  const progressFill = document.getElementById("progress-fill");
  if (progressFill) progressFill.style.width = `${(stepAtual / TOTAL_STEPS) * 100}%`;

  const btnAnterior = document.getElementById("btn-anterior");
  if (btnAnterior) btnAnterior.style.display = stepAtual > 1 ? "block" : "none";

  const btnProximo = document.getElementById("btn-proximo");
  if (btnProximo) btnProximo.textContent = stepAtual === TOTAL_STEPS ? "Finalizar →" : "Próximo →";

  if (stepAtual === 4) preencherRevisao();
  if (typeof window.scrollTo === "function") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function coletarDadosStep(numero) {
  if (numero === 1) {
    dadosFormulario.nome        = pegar("campo-nome");
    dadosFormulario.sobrenome   = pegar("campo-sobrenome");
    dadosFormulario._nascimento = pegar("campo-nascimento");
    dadosFormulario._cep        = pegar("campo-cep");
  }
  if (numero === 2) {
    dadosFormulario.contato = pegar("campo-email");
  }
  if (numero === 3) {
    dadosFormulario.instituicao  = pegar("campo-instituicao");
    dadosFormulario.cidade_curso = pegar("campo-cidade-curso");
    dadosFormulario.tipo_curso   = pegar("campo-tipo-curso");
    dadosFormulario.data_inicio  = pegar("campo-inicio");
    dadosFormulario.data_fim     = pegar("campo-fim");
  }
}

function pegar(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function validarStep(numero) {
  limparErros();
  let valido = true;

  if (numero === 1) {
    if (!pegar("campo-nome"))       { marcarErro("erro-nome",       "campo-nome",       "Nome é obrigatório");               valido = false; }
    if (!pegar("campo-sobrenome"))  { marcarErro("erro-sobrenome",  "campo-sobrenome",  "Sobrenome é obrigatório");          valido = false; }
    if (!pegar("campo-nascimento")) { marcarErro("erro-nascimento", "campo-nascimento", "Data de nascimento é obrigatória"); valido = false; }
    if (!pegar("campo-cep"))        { marcarErro("erro-cep",        "campo-cep",        "CEP é obrigatório");                valido = false; }
  }

  if (numero === 2) {
    const email    = pegar("campo-email");
    const senha    = pegar("campo-senha");
    const confirma = pegar("campo-confirmar-senha");

    if (!email.includes("@")) { marcarErro("erro-email",           "campo-email",           "Email inválido");                           valido = false; }
    if (senha.length < 8)     { marcarErro("erro-senha",           "campo-senha",           "Senha precisa ter pelo menos 8 caracteres"); valido = false; }
    if (senha !== confirma)   { marcarErro("erro-confirmar-senha", "campo-confirmar-senha", "As senhas não batem");                      valido = false; }
  }

  return valido;
}

function marcarErro(idErro, idCampo, mensagem) {
  const erroEl  = document.getElementById(idErro);
  const campoEl = document.getElementById(idCampo);
  if (erroEl)  { erroEl.textContent = mensagem; erroEl.classList.add("visivel"); }
  if (campoEl) campoEl.classList.add("erro");
}

function limparErros() {
  document.querySelectorAll(".mensagem-erro-campo").forEach(el => {
    el.textContent = "";
    el.classList.remove("visivel");
  });
  document.querySelectorAll(".campo-input.erro").forEach(el => el.classList.remove("erro"));
}

function calcularIdade(dataString) {
  if (!dataString) return "";
  const hoje       = new Date();
  const nascimento = new Date(dataString);
  let idade        = hoje.getFullYear() - nascimento.getFullYear();

  const aindaNaoFez =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

  if (aindaNaoFez) idade--;
  return idade;
}

function preencherRevisao() {
  const container = document.getElementById("revisao-dados");
  if (!container) return;

  const itens = [
    { chave: "Nome",        valor: `${dadosFormulario.nome} ${dadosFormulario.sobrenome}` },
    { chave: "Email",       valor: dadosFormulario.contato },
    { chave: "Nascimento",  valor: dadosFormulario._nascimento || "—" },
    { chave: "CEP",         valor: dadosFormulario._cep        || "—" },
    { chave: "Instituição", valor: dadosFormulario.instituicao || "Não informado" },
    { chave: "Curso",       valor: dadosFormulario.tipo_curso  || "Não informado" },
  ];

  container.innerHTML = itens.map(({ chave, valor }) => `
    <div class="revisao-item">
      <span class="revisao-chave">${chave}</span>
      <span class="revisao-valor">${valor || "—"}</span>
    </div>
  `).join("");
}

function mostrarLoading(ativo) {
  const btn = document.getElementById("btn-proximo");
  if (!btn) return;
  btn.disabled = ativo;
  btn.classList.toggle("loading", ativo);
  btn.textContent = ativo
    ? "Enviando..."
    : stepAtual === TOTAL_STEPS ? "Finalizar →" : "Próximo →";
}

function mostrarToast(mensagem, tipo = "") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = mensagem;
  toast.className   = `toast ${tipo} visivel`;
  setTimeout(() => toast.classList.remove("visivel"), 3500);
}

function configurarFoto() {
  const btnFoto     = document.getElementById("btn-foto");
  const inputFoto   = document.getElementById("input-foto");
  const fotoPreview = document.getElementById("foto-preview");
  const placeholder = document.getElementById("foto-placeholder");

  if (!btnFoto || !inputFoto) return;

  btnFoto.addEventListener("click", () => inputFoto.click());

  inputFoto.addEventListener("change", (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const reader  = new FileReader();
    reader.onload = (ev) => {
      if (!fotoPreview || !placeholder) return;
      fotoPreview.src           = ev.target.result;
      fotoPreview.style.display = "block";
      placeholder.style.display = "none";
    };
    reader.readAsDataURL(arquivo);
  });
}

function configurarVerSenha() {
  document.querySelectorAll(".btn-ver-senha").forEach(btn => {
    btn.addEventListener("click", () => {
      const input     = document.getElementById(btn.dataset.alvo);
      if (!input) return;
      const mostrando = input.type === "text";
      input.type      = mostrando ? "password" : "text";
      btn.textContent = mostrando ? "👁" : "🙈";
    });
  });
}

function configurarMascaraCEP() {
  const campoCEP = document.getElementById("campo-cep");
  if (!campoCEP) return;

  campoCEP.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5, 8);
    e.target.value = v;
  });
}

function safeAddEventListener(id, event, handler) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.addEventListener(event, handler);
  return true;
}

window.addEventListener("DOMContentLoaded", () => {
  configurarFoto();
  configurarVerSenha();
  configurarMascaraCEP();

  const hasForm = document.getElementById("progress-fill") || document.getElementById("step-1");
  if (hasForm) irParaStep(1);

  safeAddEventListener("btn-proximo", "click", async () => {
    if (!validarStep(stepAtual)) return;

    coletarDadosStep(stepAtual);

    if (stepAtual === TOTAL_STEPS) {
      if (typeof montarJSON !== "function" || typeof enviarParaAPI !== "function") {
        mostrarToast("Configuração do envio incompleta.", "erro");
        return;
      }

      try {
        const json = await montarJSON();
        await enviarParaAPI(json);
      } catch (e) {
        mostrarToast(e.message || "Erro ao enviar dados.", "erro");
      }
    } else {
      irParaStep(stepAtual + 1);
    }
  });

  safeAddEventListener("btn-anterior", "click", () => {
    if (stepAtual > 1) irParaStep(stepAtual - 1);
  });
});
