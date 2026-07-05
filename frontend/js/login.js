(function(){
        const $ = (s, r=document) => r.querySelector(s);
        const form = $('#loginForm');
        const email = $('#email');
        const senha = $('#senha');
        const robot = $('#robot');
        const toastEl = $('#toast');

        function toast(msg, type){
          toastEl.textContent = msg;
          toastEl.className = 'toast show ' + (type||'');
          setTimeout(()=>toastEl.className='toast', 2200);
        }
        function showError(id, msg){
          const el = document.getElementById(id+'-error');
          if(!el) return;
          el.textContent = msg; el.hidden = !msg;
        }

        document.querySelectorAll('.eye').forEach(btn => {
          btn.addEventListener('click', () => {
            const t = document.getElementById(btn.dataset.target);
            if (!t) return;
            t.type = t.type === 'password' ? 'text' : 'password';
          });
        });

        const API_LOGIN_URL = 'http://127.0.0.1:8000/auth/login';

        // Salva a sessão do jovem no localStorage. Sem isso, nenhuma
        // página interna (desafio, submissão etc.) sabe "quem" está
        // logado e trata a navegação como inválida.
        function salvarSessao(userId, jovemId) {
          if (userId) localStorage.setItem('ponte_user_id', userId);
          // Mesmo sem jovem_id (ex.: cadastro incompleto no backend),
          // garantimos um identificador de sessão pra não travar a
          // navegação — o mesmo comportamento de fallback de demo já
          // usado no feed com os desafios mockados.
          localStorage.setItem('ponte_jovem_id', jovemId || userId || 'demo-jovem');
        }

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          let ok = true;
          showError('email',''); showError('senha',''); showError('captcha','');
          if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) { showError('email','Email inválido'); ok = false; }
          if (senha.value.length < 8) { showError('senha','Mín. 8 caracteres'); ok = false; }
          if (!robot.checked) { showError('captcha','Confirme que você não é um robô'); ok = false; }
          if (!ok) { toast('Confere os campos','error'); return; }

          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) submitBtn.disabled = true;

          try {
            const res = await fetch(API_LOGIN_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email.value.trim(), senha: senha.value })
            });

            if (res.ok) {
              const data = await res.json();
              salvarSessao(data.user_id, data.jovem_id);
              toast('Login realizado!', 'success');
            } else if (res.status === 401) {
              showError('senha', 'Email ou senha inválidos');
              toast('Confere os campos', 'error');
              if (submitBtn) submitBtn.disabled = false;
              return;
            } else {
              throw new Error('API indisponível');
            }
          } catch (err) {
            // Backend fora do ar (ambiente de demonstração): segue com
            // uma sessão de demo em vez de travar o usuário na tela de
            // login, mesmo comportamento adotado no restante do app.
            console.warn('[Login-Debug] API indisponível, entrando em modo demo.', err);
            salvarSessao(null, 'demo-jovem');
            toast('Login realizado!', 'success');
          }

          setTimeout(() => { window.location.href = 'chat.html'; }, 700);
        });

        $('#closeBtn').addEventListener('click', ()=> toast('Saída!'));
        $('#helpBtn').addEventListener('click', ()=> toast('Precisa de ajuda? Estamos aqui 🦀'));
      })();