/* ═══════════════════════════════════════════════════════════
   P.O.N.T.E. — desafio.js
   Escopo visual (Sprint 3): apenas comportamentos de UI
   puros, sem lógica de estado de negócio ou DOM complexo.
   O integrador pode ampliar via eventos customizados.
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Salvar / curtir ─── */
  const btnSave = document.getElementById('btn-save');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      btnSave.classList.toggle('saved');
      // Dispara evento customizado para o integrador capturar
      document.dispatchEvent(new CustomEvent('ponte:challenge-saved', {
        detail: { saved: btnSave.classList.contains('saved') }
      }));
    });
  }

  /* ─── Aceitar ➜ revelar botão Enviar ─── */
  const btnAccept = document.getElementById('btn-accept');
  const btnSubmit = document.getElementById('btn-submit');

  if (btnAccept && btnSubmit) {
    btnAccept.addEventListener('click', () => {
      // Escopo visual: apenas troca os botões
      btnAccept.hidden = true;
      btnSubmit.hidden = false;

      // Rola suavemente até a âncora de submissão
      const anchor = document.getElementById('section-submission-form');
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Evento para o integrador acoplar lógica real
      document.dispatchEvent(new CustomEvent('ponte:challenge-accepted', {
        detail: { challengeId: btnAccept.dataset.challengeId }
      }));
    });

    btnSubmit.addEventListener('click', () => {
      // Evento para o integrador abrir o formulário de submissão
      document.dispatchEvent(new CustomEvent('ponte:challenge-submit-clicked', {
        detail: { challengeId: btnSubmit.dataset.challengeId }
      }));
    });
  }

})();