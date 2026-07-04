// Menu mobile (hambúrguer)
const navBurger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');

navBurger.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('open');
  navBurger.setAttribute('aria-expanded', String(isOpen));
});

navMobile.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navMobile.classList.remove('open');
    navBurger.setAttribute('aria-expanded', 'false');
  });
});

// Sequência cinematográfica do chat mockado (typing → mensagem)
const typingBubble = document.getElementById('typingBubble');
const chatBubbles = document.querySelectorAll('#chatMockBody .bubble[data-t]:not(.typing)');
const chatSkills = document.querySelectorAll('#chatMockSkills span[data-t]');

function runChatSequence() {
  const items = [...chatBubbles].map(el => ({ el, t: Number(el.dataset.t), kind: 'bubble' }))
    .concat([...chatSkills].map(el => ({ el, t: Number(el.dataset.t), kind: 'skill' })))
    .sort((a, b) => a.t - b.t);

  let delay = 300;
  items.forEach((item, idx) => {
    if (item.kind === 'bubble') {
      const showTyping = item.el.classList.contains('bot');
      if (showTyping && typingBubble) {
        setTimeout(() => typingBubble.classList.add('is-in'), delay);
        delay += 750;
        setTimeout(() => typingBubble.classList.remove('is-in'), delay);
      }
      setTimeout(() => item.el.classList.add('is-in'), delay);
      delay += 550;
    } else {
      setTimeout(() => item.el.classList.add('is-in'), delay);
      delay += 220;
    }
  });
}

if ('IntersectionObserver' in window) {
  const heroCard = document.getElementById('heroCard');
  if (heroCard) {
    const ioChat = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runChatSequence();
          ioChat.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    ioChat.observe(heroCard);
  }
} else {
  runChatSequence();
}

// Botões com efeito magnético (seguem o cursor sutilmente)
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// Parallax sutil do card do chat ao mover o mouse no hero
const heroSection = document.getElementById('hero');
const heroCardEl = document.getElementById('heroCard');
if (heroSection && heroCardEl && window.matchMedia('(min-width: 861px)').matches) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroCardEl.style.transform = `translate(${x * 14}px, ${y * 14}px)`;
  });
  heroSection.addEventListener('mouseleave', () => { heroCardEl.style.transform = ''; });
}
const navEl = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 12);
}, { passive: true });

// Animações de entrada ao rolar (scroll reveal)
const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// Contador animado das estatísticas
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.count.includes('.') ? 1 : 0;
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals).replace('.', ',') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const ioCount = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        ioCount.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => ioCount.observe(el));
}
