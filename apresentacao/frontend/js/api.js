// quando Pedro terminar o backend, troca a URL e muda MOCK_MODE pra false
const API_URL   = "https://api-ponte.com/sheets/inserir";
const MOCK_MODE = false;

function esperar(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// converte o CEP em "Bairro, Cidade" usando a API gratuita ViaCEP
async function buscarBairro(cep) {
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) return cep;

  try {
    const res   = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const dados = await res.json();
    if (dados.erro) return cep;

    const { bairro, localidade } = dados;
    if (bairro && localidade) return `${bairro}, ${localidade}`;
    return localidade || cep;
  } catch {
    return cep;
  }
}

// monta o objeto final que vai virar uma linha no Google Sheets de Pedro
async function montarJSON() {
  if (!dadosFormulario._nascimento) throw new Error("Data de nascimento obrigatória");
  const idade = calcularIdade(dadosFormulario._nascimento);
  const bairro = await buscarBairro(dadosFormulario._cep || "");

  return {
    timestamp:              new Date().toISOString(),
    nome:                   dadosFormulario.nome,
    sobrenome:              dadosFormulario.sobrenome,
    idade,
    bairro,
    experiencias_informais: dadosFormulario.experiencias_informais,
    instituicao:            dadosFormulario.instituicao,
    cidade_curso:           dadosFormulario.cidade_curso,
    tipo_curso:             dadosFormulario.tipo_curso,
    data_inicio:            dadosFormulario.data_inicio,
    data_fim:               dadosFormulario.data_fim,
    contato:                dadosFormulario.contato
  };
}

async function enviarParaAPI(json) {
  console.log('[API] enviarParaAPI iniciado', json);
  mostrarLoading(true);

  try {
    if (MOCK_MODE) {
      console.log("[MOCK] dados que iriam pro Google Sheets:", json);
      await esperar(1500);
    } else {
      const res = await fetch(API_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(json)
      });
      const text = await res.text();
      console.log('[API] resposta enviarParaAPI', res.status, text);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
    }

    mostrarToast("Cadastro salvo! Te avisamos quando o PONTE lançar.", "sucesso");
    await esperar(1800);
    // window.location.href = "index.html"; // descomentar quando tiver a tela de confirmação

  } catch (e) {
    console.error('[API] enviarParaAPI erro', e);
    const semInternet = e instanceof TypeError && e.message.includes("fetch");
    mostrarToast(
      semInternet
        ? "Sem conexão. Verifica a internet e tenta de novo."
        : "Algo deu errado. Tenta de novo.",
      "erro"
    );
  } finally {
    mostrarLoading(false);
  }
}

async function dispararParaOSheets(dadosChat) {
  // Cria strings formatadas para os arrays de formação
  const strInstituicoes = dadosChat.formacoes.map(f => f.instituicao).join(" | ");
  const strCidades      = dadosChat.formacoes.map(f => f.cidade).join(" | ");
  const strCursos       = dadosChat.formacoes.map(f => f.curso).join(" | ");
  const strInicios      = dadosChat.formacoes.map(f => f.inicio).join(" | ");
  const strFins         = dadosChat.formacoes.map(f => f.fim).join(" | ");

  const payload = {
    Nome: dadosChat.nome,
    Sobrenome: dadosChat.sobrenome,
    Idade: parseInt(dadosChat.idade) || 0,
    Bairro: dadosChat.bairro,
    Experiencias_Informais: dadosChat.experiencias.join(", "),
    Instituicao: strInstituicoes,   // Agora vai mandar: "Senac | ETE"
    Cidade_Curso: strCidades,       // "Paulista | Recife"
    Tipo_Curso: strCursos,          // "Ensino Médio | Técnico"
    Data_Inicio: strInicios,        // "02/2022 | 01/2025"
    Data_Fim: strFins,              // "12/2024 | Atual"
    Contato_WhatsApp_Email: dadosChat.contato
  };

  console.groupCollapsed('[API] dispararParaOSheets');
  console.log('payload formatado para múltiplas formações:', payload);
  
  try {
    const res = await fetch("http://localhost:8000/sheets/inserir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('[API] resposta', res.status, text);
    if (!res.ok) throw new Error(`API error! status=${res.status}`);
    console.log("[API] Sucesso!");
  } catch (erro) {
    console.error("[API] Erro:", erro);
    localStorage.setItem("ponte_backup_offline", JSON.stringify(payload));
  } finally {
    console.groupEnd();
  }
}