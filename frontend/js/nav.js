// Conecta a sidebar (Home / Vagas / avatar do usuário) entre as
// páginas internas do app. Antes, esses itens eram só visuais —
// agora navegam de verdade entre feed, oportunidade e ponte pass.

document.addEventListener('DOMContentLoaded', () => {
  const routes = {
    home: 'feed.html',
    vagas: 'oportunidades.html',
    mensagens: 'chat.html',
  };

  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    const page = item.dataset.page;
    if (routes[page]) {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => { window.location.href = routes[page]; });
    }
  });

  const sidebarUser = document.querySelector('.sidebar-user');
  if (sidebarUser && !window.location.pathname.endsWith('pontepass.html')) {
    sidebarUser.style.cursor = 'pointer';
    sidebarUser.title = 'Ver meu Ponte Pass';
    sidebarUser.addEventListener('click', () => { window.location.href = 'pontepass.html'; });
  }
});
