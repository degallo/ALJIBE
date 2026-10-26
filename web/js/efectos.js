// Efectos comunes: aparición al hacer scroll, cifras que cuentan,
// foco de luz que sigue al cursor, efecto imán y barra de progreso.
import { el, reducirMovimiento } from './nucleo/dom.js';

let iniciado = false;

function revelar() {
  const nodos = document.querySelectorAll('[data-revelar]:not(.reveal)');
  if (!('IntersectionObserver' in window)) return;
  const grupos = new Map();
  nodos.forEach((n) => {
    const padre = n.parentElement;
    const i = grupos.get(padre) || 0;
    grupos.set(padre, i + 1);
    n.classList.add('reveal');
    n.style.setProperty('--i', Math.min(i, 8));
    n.addEventListener('transitionend', function fin(e) {
      if (e.target !== n || e.propertyName !== 'opacity') return;
      n.classList.remove('reveal', 'visible');
      n.style.removeProperty('--i');
      n.removeEventListener('transitionend', fin);
    });
  });
  const obs = new IntersectionObserver((items) => {
    items.forEach((it) => {
      if (it.isIntersecting) { it.target.classList.add('visible'); obs.unobserve(it.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  nodos.forEach((n) => obs.observe(n));
}

// <span data-contar>7.600</span>: sube desde 0 cuando entra en pantalla
export function contar(nodo, duracion = 1200) {
  const final = nodo.textContent;
  const meta = parseInt(final.replace(/\D/g, ''), 10);
  if (reducirMovimiento() || !meta || /,/.test(final)) return;
  let inicio = null;
  const paso = (ts) => {
    if (inicio === null) inicio = ts;
    const k = Math.min((ts - inicio) / duracion, 1);
    const v = Math.round(meta * (1 - Math.pow(1 - k, 3)));
    nodo.textContent = k < 1 ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : final;
    if (k < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

function cifras() {
  const nodos = document.querySelectorAll('[data-contar]:not([data-contado])');
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver((items) => {
    items.forEach((it) => {
      if (it.isIntersecting) { it.target.dataset.contado = ''; contar(it.target); obs.unobserve(it.target); }
    });
  }, { threshold: 0.4 });
  nodos.forEach((n) => obs.observe(n));
}

function cursor() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.addEventListener('pointermove', (e) => {
    const n = e.target.closest && e.target.closest('.luz, .tarjeta, .servicio');
    if (!n) return;
    const r = n.getBoundingClientRect();
    n.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    n.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
  document.addEventListener('pointermove', (e) => {
    const b = e.target.closest && e.target.closest('.boton, .icono-nav');
    document.querySelectorAll('.iman').forEach((n) => { if (n !== b) { n.style.translate = ''; n.classList.remove('iman'); } });
    if (!b) return;
    const r = b.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.2;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.2;
    b.classList.add('iman');
    b.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
  }, { passive: true });
}

function progreso() {
  const b = el('div', 'progreso');
  b.setAttribute('aria-hidden', 'true');
  document.body.appendChild(b);
  const act = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    b.style.setProperty('--p', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
  };
  window.addEventListener('scroll', act, { passive: true });
  window.addEventListener('resize', act);
  act();
}

export function iniciarEfectos() {
  if (reducirMovimiento()) return;
  revelar();
  cifras();
  if (iniciado) return;
  iniciado = true;
  cursor();
  progreso();
}
