const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector('.menu');
const topbar = document.querySelector('.top');
if (menu) {
  topbar.classList.add('menu-ready');
  menu.hidden = false;
  function setMenu(open) {
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('click', event => {
    if (!topbar.contains(event.target) || event.target.closest('#nav a')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
  matchMedia('(max-width: 650px)').addEventListener('change', () => setMenu(false));
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('scroll-in');
      observer.unobserve(entry.target);
    }
  }, {threshold: .08});
  document.querySelectorAll('[data-reveal]').forEach(section => observer.observe(section));
}

const parallax = document.querySelector('[data-parallax]');
if (parallax) {
  let queued = false;
  function updateParallax() {
    queued = false;
    if (reducedMotion.matches) {
      parallax.style.removeProperty('--shift');
      return;
    }
    const rect = parallax.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const progress = (innerHeight / 2 - rect.top - rect.height / 2) / ((innerHeight + rect.height) / 2);
    parallax.style.setProperty('--shift', Math.max(-1, Math.min(1, progress)) * 94 + 'px');
  }
  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(updateParallax);
  }
  addEventListener('scroll', queue, {passive:true});
  addEventListener('resize', queue);
  reducedMotion.addEventListener('change', queue);
  queue();
}

const dialog = document.querySelector('.work-dialog');
if (dialog) {
  let trigger;
  document.querySelector('.work-grid').addEventListener('click', event => {
    const button = event.target.closest('[data-work]');
    if (!button) return;
    trigger = button;
    const card = button.closest('.work-card');
    const image = dialog.querySelector('img');
    image.src = button.querySelector('img').src;
    image.alt = button.querySelector('img').alt;
    dialog.querySelector('[data-work-title]').textContent = card.querySelector('h3').textContent;
    dialog.querySelector('[data-work-link]').href = card.querySelector('a').href;
    dialog.showModal();
  });
  dialog.addEventListener('close', () => trigger?.focus({preventScroll:true}));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
}

const contactForm = document.querySelector('[data-contact]');
if (contactForm) {
  contactForm.querySelector('[type=submit]').disabled = false;
  const requestedService = new URLSearchParams(location.search).get('servicio');
  if ([...contactForm.elements.servicio.options].some(option => option.value === requestedService)) {
    contactForm.elements.servicio.value = requestedService;
  }
  contactForm.addEventListener('input', event => event.target.setCustomValidity?.(''));
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    for (const field of contactForm.querySelectorAll('[required]')) {
      field.setCustomValidity(field.value.trim() ? '' : 'Completá este campo.');
    }
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm);
    const service = contactForm.elements.servicio.selectedOptions[0].textContent;
    const message = [
      'Hola, Instalaciones MDQ. Quisiera consultar por un trabajo.',
      'Nombre: ' + data.get('nombre').trim(),
      'Barrio o zona: ' + data.get('zona').trim(),
      'Servicio: ' + service,
      'Consulta: ' + data.get('detalle').trim()
    ].join('\n');
    const destination = new URL('https://wa.me/5492234251679');
    destination.searchParams.set('text', message);
    location.assign(destination.href);
  });
}
