const API_URL = "http://127.0.0.1:8000/auth/cadastro/jovem";
const MOCK_MODE = false;

// Função segura para mostrar mensagem (se não achar o HTML, usa o alert nativo)
function mostrarToast(mensagem, tipo = "") {
  console.log(`[Toast] Tentando mostrar: ${mensagem} | Tipo: ${tipo}`);
  const toast = document.getElementById("toast");
  if (!toast) {
    console.warn("[Toast] Elemento HTML 'toast' não encontrado. Usando alert.");
    alert(mensagem);
    return;
  }
  toast.textContent = mensagem;
  toast.className = `toast show ${tipo}`;
  setTimeout(() => toast.className = "toast", 3500);
}

// converte o CEP em "Bairro, Cidade"
async function buscarBairro(cep) {
  console.log(`[API-Debug] Buscando bairro para o CEP: ${cep}`);
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) return cep;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const dados = await res.json();
    console.log(`[API-Debug] Retorno do ViaCEP:`, dados);
    if (dados.erro) return cep;
    const { bairro, localidade } = dados;
    if (bairro && localidade) return `${bairro}, ${localidade}`;
    return localidade || cep;
  } catch (e) {
    console.error(`[API-Debug] Erro no ViaCEP:`, e);
    return cep;
  }
}

// recebe "AAAA-MM-DD" e devolve a idade
function calcularIdade(dataString) {
  if (!dataString) return "";
  const hoje = new Date();
  const nascimento = new Date(dataString);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFez = hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFez) idade--;
  console.log(`[API-Debug] Data nasc: ${dataString} | Idade calculada: ${idade}`);
  return idade;
}

// monta o objeto final
async function montarJSON(state) {
  console.log("[API-Debug] Iniciando montarJSON com o state da Ana:", state);
  
  try {
    const [dia, mes, ano] = state.basico.nascimento.split('/');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    const idade = calcularIdade(dataFormatada);
    
    const bairroLocal = await buscarBairro(state.basico.cep);

    const formacoesMapeadas = state.formacoes.map(f => ({
        instituicao: f.instituicao,
        cidade: f.cidade,
        curso: f.curso,
        inicio: f.inicio, // Garantindo o nome certo
        fim: f.fim || "Cursando" // Garantindo o nome certo
    }));

    const jsonFinal = {
      nome: state.basico.nome,
      sobrenome: state.basico.sobrenome,
      idade: idade,
      bairro: bairroLocal,
      email: state.auth.email,
      senha: state.auth.senha,
      formacoes: formacoesMapeadas,
      foto_perfil: state.foto || null
    };

    console.log("[API-Debug] JSON montado com SUCESSO. Pronto para envio:", jsonFinal);
    return jsonFinal;
  } catch (erro) {
    console.error("[API-Debug] CRASH fatal dentro do montarJSON:", erro);
    throw erro; // Repassa o erro para parar a execução
  }
}

async function enviarParaAPI(state) {
  console.log('\n======================================');
  console.log('[API-Debug] 1. enviarParaAPI ACIONADO!');
  mostrarToast("Validando dados...", "info");

  try {
    console.log('[API-Debug] 2. Chamando montarJSON...');
    const json = await montarJSON(state);

    console.log(`[API-Debug] 3. Disparando POST para: ${API_URL}`);
    const res = await fetch(API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(json)
    });
    
    console.log(`[API-Debug] 4. Resposta bruta do servidor. Status: ${res.status}`);
    const data = await res.json();
    console.log(`[API-Debug] 5. JSON da resposta:`, data);
    
    if (!res.ok) {
        throw new Error(data.detail || `Erro HTTP ${res.status}`);
    }

    console.log('[API-Debug] 6. SUCESSO! Salvando IDs no localStorage...');
    localStorage.setItem('ponte_user_id', data.user_id);
    localStorage.setItem('ponte_jovem_id', data.jovem_id);

    mostrarToast("Cadastro salvo! Indo pro Manguelito...", "success");
    
    console.log('[API-Debug] 7. Iniciando contagem para redirecionar...');
    setTimeout(() => {
       console.log('[API-Debug] 8. Redirecionando AGORA para chat.html');
       window.location.href = "chat.html"; 
    }, 1500);

  } catch (e) {
    console.error('\n[API-Debug] ❌ DEU RUIM NO ENVIAR PARA API ❌');
    console.error(e);
    alert(`ERRO CRÍTICO: ${e.message}\nVeja o console (F12) para detalhes.`);
  }
}

// ─── PONTO DE CONTATO COM O CADASTRO.JS ──────────────────────────────
window.PONTE = {
  enviar(estadoCompleto) {
    console.log('[API-Debug] window.PONTE.enviar chamado pelo cadastro.js');
    enviarParaAPI(estadoCompleto);
  }
};