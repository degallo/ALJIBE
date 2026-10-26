// Marco común de todas las pantallas: barra lateral, pie y modo presentación
import { el, icono, raiz, reducirMovimiento } from './nucleo/dom.js';
import { servidor } from './nucleo/api.js';
import { iniciarEfectos } from './efectos.js';
import { iniciarPresentacion } from './presentacion.js';

const SECCIONES = [
  { id: 'inicio', nombre: 'Inicio', href: 'index.html', icono: 'inicio' },
  { id: 'cuadros', nombre: 'Cuadros de mando', href: 'fiesta-del-vino.html', icono: 'barras' },
  { id: 'decisiones', nombre: 'Decisiones', href: 'decisiones.html', icono: 'diana' },
  { id: 'servicios', nombre: 'Servicios', href: 'servicios.html', icono: 'cuadricula' },
  { id: 'entregables', nombre: 'Entregables', href: 'entregables/index.html', icono: 'documento' }
];

function pintarLateral(aside, actual) {
  aside.textContent = '';
  const logo = el('a', 'lateral__logo');
  logo.href = raiz() + 'index.html';
  logo.setAttribute('aria-label', 'ALJIBE, inicio');
  const img = el('img');
  img.src = raiz() + 'logos/aljibe-mark.svg';
  img.alt = '';
  logo.appendChild(img);
  aside.appendChild(logo);

  const nav = el('nav', 'lateral__nav');
  nav.setAttribute('aria-label', 'Secciones de la web');
  for (const s of SECCIONES) {
    const a = el('a', 'icono-nav');
    a.href = raiz() + s.href;
    a.setAttribute('aria-label', s.nombre);
    a.dataset.tip = s.nombre;
    if (s.id === actual) a.setAttribute('aria-current', 'page');
    a.appendChild(icono(s.icono));
    const nombre = el('span', 'icono-nav__nombre', s.nombre);
    nombre.setAttribute('aria-hidden', 'true');
    a.appendChild(nombre);
    nav.appendChild(a);
  }
  aside.appendChild(nav);

  const presentar = el('button', 'icono-nav icono-nav--presentar');
  presentar.type = 'button';
  presentar.setAttribute('aria-label', 'Presentar en clase');
  presentar.dataset.tip = 'Presentar en clase (P)';
  presentar.dataset.presentar = '';
  presentar.appendChild(icono('presentacion'));
  aside.appendChild(presentar);

  const sello = el('span', 'lateral__sello', 'G3');
  sello.setAttribute('role', 'img');
  sello.setAttribute('aria-label', 'Equipo 3');
  aside.appendChild(sello);
}

function pintarPie(contenido) {
  const pie = el('footer', 'pie');
  const texto = el('p', 'pie__texto', 'ALJIBE · Prototipo académico · Creación de Empresas · Universidad de Granada · Equipo 3');
  const estado = el('span', 'pie__estado');
  estado.setAttribute('role', 'status');
  estado.append(icono('servidor'), el('span', null, 'Comprobando servidor…'));
  pie.append(texto, estado);
  contenido.appendChild(pie);
  servidor().then((hay) => {
    estado.classList.add(hay ? 'pie__estado--si' : 'pie__estado--no');
    estado.lastChild.textContent = hay ? 'Conectado al servidor de ALJIBE' : 'Modo sin servidor: los cálculos se hacen en este navegador';
  });
}

// La barra de píldoras se vuelve de cristal al hacer scroll
function barraFija() {
  const barra = document.querySelector('.barra');
  if (!barra) return;
  let pendiente = false;
  const actualizar = () => { pendiente = false; barra.classList.toggle('barra--fija', window.scrollY > 24); };
  window.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } }, { passive: true });
  actualizar();
}

export function iniciarMarco() {
  if (!reducirMovimiento()) document.documentElement.classList.add('js');
  const actual = document.body.dataset.seccion;
  const aside = document.getElementById('lateral');
  if (aside) pintarLateral(aside, actual);
  const contenido = document.querySelector('.contenido');
  if (contenido && !document.body.hasAttribute('data-sin-pie')) pintarPie(contenido);
  barraFija();
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('[data-imprimir]')) window.print();
  });
  iniciarPresentacion();
}

// Para llamar cuando la pantalla ya ha pintado sus datos
export function listo() {
  iniciarEfectos();
  document.body.dataset.listo = '1';
  document.dispatchEvent(new CustomEvent('aljibe:listo'));
}

export function mostrarError(e) {
  const aviso = el('p', 'aviso-datos', 'No se han podido cargar los datos. Abre la web desde el servidor (npm start en la carpeta web) o desde su dirección publicada.');
  aviso.setAttribute('role', 'alert');
  const contenido = document.querySelector('.contenido');
  contenido.insertBefore(aviso, contenido.children[1] || null);
  console.error(e);
}
