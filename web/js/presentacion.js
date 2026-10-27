// Modo presentación para clase: recorre la web paso a paso con las flechas,
// Av Pág/Re Pág (mandos de presentación), Espacio o los botones de la barra.
//   P: empezar · N: notas · F: pantalla completa · Esc: salir
import { el, icono, raiz, reducirMovimiento } from './nucleo/dom.js';
import { datos } from './nucleo/api.js';

const CLAVE = 'aljibe-presentacion';
let pasos = [];
let actual = 0; // índice desde 1; 0 = apagado
let barra, contador, titulo, notas, botonNotas, anuncio, enfocado;

const rutaActual = () => document.body.dataset.ruta || 'index.html';

function leerSesion() {
  try { return JSON.parse(sessionStorage.getItem(CLAVE) || 'null'); } catch { return null; }
}
function guardarSesion(v) {
  try { v ? sessionStorage.setItem(CLAVE, JSON.stringify(v)) : sessionStorage.removeItem(CLAVE); } catch { /* sin almacenamiento */ }
}

function crearBarra() {
  barra = el('div', 'presenta');
  barra.setAttribute('role', 'region');
  barra.setAttribute('aria-label', 'Presentación');

  notas = el('div', 'presenta__notas');
  notas.id = 'presenta-notas';
  notas.hidden = true;

  const fila = el('div', 'presenta__fila');
  const atras = el('button', 'presenta__boton');
  atras.type = 'button';
  atras.setAttribute('aria-label', 'Paso anterior');
  atras.appendChild(icono('izquierda'));
  atras.addEventListener('click', () => ir(actual - 1));

  contador = el('span', 'presenta__contador');
  titulo = el('span', 'presenta__titulo');

  const adelante = el('button', 'presenta__boton presenta__boton--principal');
  adelante.type = 'button';
  adelante.setAttribute('aria-label', 'Paso siguiente');
  adelante.appendChild(icono('derecha'));
  adelante.addEventListener('click', () => ir(actual + 1));

  botonNotas = el('button', 'presenta__boton');
  botonNotas.type = 'button';
  botonNotas.setAttribute('aria-label', 'Notas para quien presenta');
  botonNotas.setAttribute('aria-expanded', 'false');
  botonNotas.setAttribute('aria-controls', 'presenta-notas');
  botonNotas.appendChild(icono('notas'));
  botonNotas.addEventListener('click', alternarNotas);

  const completa = el('button', 'presenta__boton');
  completa.type = 'button';
  completa.setAttribute('aria-label', 'Pantalla completa');
  completa.appendChild(icono('ampliar'));
  completa.addEventListener('click', pantallaCompleta);

  const salir = el('button', 'presenta__boton');
  salir.type = 'button';
  salir.setAttribute('aria-label', 'Salir de la presentación');
  salir.appendChild(icono('cerrar'));
  salir.addEventListener('click', terminar);

  const texto = el('span', 'presenta__texto');
  texto.append(contador, titulo);
  fila.append(atras, texto, adelante, botonNotas, completa, salir);

  anuncio = el('span', 'solo-lectores');
  anuncio.setAttribute('aria-live', 'polite');

  barra.append(notas, fila, anuncio);
  document.body.appendChild(barra);
  document.documentElement.classList.add('presentando');
}

function alternarNotas() {
  notas.hidden = !notas.hidden;
  botonNotas.setAttribute('aria-expanded', String(!notas.hidden));
  guardarSesion({ paso: actual, notas: !notas.hidden });
}

function pantallaCompleta() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
  else document.exitFullscreen?.();
}

function quitarFoco() {
  if (enfocado) enfocado.classList.remove('foco-presentacion');
  enfocado = null;
}

function mostrar(n) {
  const paso = pasos[n - 1];
  actual = n;
  if (!barra) crearBarra();
  contador.textContent = n + '/' + pasos.length;
  titulo.textContent = paso.titulo;
  notas.textContent = paso.nota || '';
  anuncio.textContent = 'Paso ' + n + ' de ' + pasos.length + ': ' + paso.titulo;
  const sesion = leerSesion();
  guardarSesion({ paso: n, notas: sesion ? sesion.notas : false });
  if (sesion && sesion.notas && notas.hidden) alternarNotas();

  const url = new URL(location.href);
  url.searchParams.set('presentar', n);
  history.replaceState(null, '', url);

  quitarFoco();
  const destino = paso.ancla && document.querySelector(paso.ancla);
  if (destino) {
    enfocado = destino;
    destino.classList.add('foco-presentacion');
    const alto = destino.getBoundingClientRect().height;
    destino.scrollIntoView({ block: alto > window.innerHeight * 0.75 ? 'start' : 'center', behavior: reducirMovimiento() ? 'auto' : 'smooth' });
  }
  if (paso.accion) document.dispatchEvent(new CustomEvent('aljibe:accion', { detail: paso.accion }));
}

function ir(n) {
  if (n < 1 || n > pasos.length) return;
  const paso = pasos[n - 1];
  if (paso.pagina !== rutaActual()) {
    guardarSesion({ paso: n, notas: notas ? !notas.hidden : false });
    location.href = raiz() + paso.pagina + '?presentar=' + n;
    return;
  }
  mostrar(n);
}

function terminar() {
  quitarFoco();
  actual = 0;
  guardarSesion(null);
  barra?.remove();
  barra = null;
  document.documentElement.classList.remove('presentando');
  const url = new URL(location.href);
  url.searchParams.delete('presentar');
  history.replaceState(null, '', url);
}

async function empezar(n) {
  if (!pasos.length) pasos = (await datos('presentacion')).pasos;
  if (!n) {
    const aqui = pasos.findIndex((p) => p.pagina === rutaActual());
    n = aqui >= 0 ? aqui + 1 : 1;
  }
  ir(n);
}

function teclas(e) {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  const t = e.target;
  if (t.closest && t.closest('input, textarea, select, [contenteditable], [role="slider"]')) return;
  if (!actual) {
    if (e.key === 'p' || e.key === 'P') { e.preventDefault(); empezar(); }
    return;
  }
  const siguiente = ['ArrowRight', 'PageDown'].includes(e.key) || (e.key === ' ' && !t.closest('button, a'));
  const anterior = ['ArrowLeft', 'PageUp'].includes(e.key);
  if (siguiente) { e.preventDefault(); ir(actual + 1); }
  else if (anterior) { e.preventDefault(); ir(actual - 1); }
  else if (e.key === 'Escape') { e.preventDefault(); terminar(); }
  else if (e.key === 'n' || e.key === 'N') { e.preventDefault(); alternarNotas(); }
  else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); pantallaCompleta(); }
}

export function iniciarPresentacion() {
  document.addEventListener('keydown', teclas);
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('[data-presentar]')) empezar();
  });
  const param = Number(new URLSearchParams(location.search).get('presentar'));
  const n = param;
  if (n) {
    // Espera a que la pantalla pinte sus datos para poder enfocar el paso
    const arrancar = () => empezar(n);
    if (document.body.dataset.listo) arrancar();
    else document.addEventListener('aljibe:listo', arrancar, { once: true });
  }
}
