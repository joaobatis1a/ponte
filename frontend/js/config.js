// ═══════════════════════════════════════════════════════════
// P.O.N.T.E. — configuração global do frontend
//
// MODO_DEMO = true:
//   A aplicação nem tenta chamar o backend. Todas as telas usam
//   direto os dados de demonstração já embutidos em cada página
//   (feed.js, desafio.js etc.), sem esperar o timeout de uma
//   chamada de rede que sabidamente vai falhar. Ideal quando só
//   o frontend está publicado (ex.: demo no Vercel sem backend).
//
// MODO_DEMO = false:
//   A aplicação tenta falar de verdade com a API em API_BASE_URL
//   antes de cair no fallback de mock.
//
// Quando o backend for publicado, troque MODO_DEMO para false e
// aponte API_BASE_URL para a URL pública dele (ex.: Render/Railway).
// Este é o único lugar que precisa ser alterado.
// ═══════════════════════════════════════════════════════════
window.PONTE_CONFIG = {
  MODO_DEMO: true,
  API_BASE_URL: 'http://127.0.0.1:8000'
};
