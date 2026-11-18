// Muestra de la gramática del aljibe (docs/directrices-diseno.md): tres
// diapositivas con el contenido real de datos/exposicion.json.
import { datos } from '../js/nucleo/api.js';

const SVG = 'http://www.w3.org/2000/svg';
const el = (tag, clase, texto) => {
  const n = document.createElement(tag);
  if (clase) n.className = clase;
  if (texto != null) n.textContent = texto;
  return n;
};
const svg = (tag, attrs = {}) => {
  const n = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
};

// El módulo: rectángulo coronado por un semicírculo (la bóveda del aljibe)
const arco = (x, y, w, h) => `M${x} ${y + h}V${y + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}V${y + h}Z`;

// Un arco con su lámina de agua; nivel entre 0 y 1
function modulo(g, x, y, w, h, nivel, { clase = 'agua', trazo = '', i = 0 } = {}) {
  const id = 'c' + Math.random().toString(36).slice(2);
  const clip = svg('clipPath', { id });
  clip.appendChild(svg('path', { d: arco(x, y, w, h) }));
  g.appendChild(clip);
  if (nivel > 0) {
    const r = svg('rect', { x, y: y + h * (1 - nivel), width: w, height: h * nivel, class: clase + ' sube', 'clip-path': `url(#${id})` });
    r.style.setProperty('--i', i);
    g.appendChild(r);
  }
  g.appendChild(svg('path', { d: arco(x, y, w, h), class: 'arco ' + trazo }));
}

function lamina(numero, seccion, negativa = false) {
  const s = el('section', 'lamina' + (negativa ? ' lamina--negativa' : ''));
  s.setAttribute('aria-label', numero + ' · ' + seccion);
  s.append(el('div', 'reticula'));
  const cab = el('header', 'cabecera');
  cab.append(el('span', null, seccion), el('span', null, numero));
  s.append(cab);
  return s;
}

function lienzo(x, y, w, h) {
  const s = svg('svg', { class: 'modulos', viewBox: `0 0 ${w} ${h}`, width: w, height: h, 'aria-hidden': 'true' });
  s.style.left = x + 'px';
  s.style.top = y + 'px';
  return s;
}

// 1 · Portada: un solo módulo grande, en negativo (Wong, pp. 47-48)
function portada(d) {
  const s = lamina('01', d.etiqueta, true);
  const t = el('h1', 'celda enorme p-titulo', d.titular);
  const p = el('p', 'celda texto p-pregunta', d.pregunta);
  const logo = el('img', 'p-logo');
  logo.src = '../logos/aljibe-lockup-inverse.svg';
  logo.alt = 'ALJIBE';
  const pie = el('p', 'celda fig p-pie', d.pie);
  // Arco de 4 columnas por 5 filas, con el agua a media altura
  const c = lienzo(120 + 8 * 140, 175, 560, 702);
  const g = svg('g', { color: '#F6F3EE' });
  modulo(g, 1, 1, 558, 700, 0.42);
  c.appendChild(g);
  const fig = el('p', 'celda fig');
  fig.style.cssText = '--c:9;--f:6;--ac:4;top:895px';
  fig.textContent = 'fig. 01 · módulo: el arco del aljibe';
  s.append(t, p, c, fig, logo, pie);
  return s;
}

// 4 · Propuesta de valor: repetición y anomalía (Wong, pp. 51 y 99).
// Cada arco es un municipio de la provincia de Granada; los llenos son los
// de menos de 5.000 habitantes: «los pueblos».
function valor(d, municipios) {
  const s = lamina('04', d.etiqueta);
  s.append(el('h2', 'celda grande v-titulo', d.titular));
  const clave = el('div', 'celda v-clave');
  clave.append(el('p', 'fig', d.clave.etiqueta), el('p', 'v-pueblos', d.clave.titulo), el('p', 'texto texto--fuerte', d.clave.texto));
  s.append(clave);

  const cols = 29, filas = 6, w = 26, h = 38, gx = 10, gy = 14;
  const c = lienzo(120 + 4 * 140 + 70, 450, cols * (w + gx), filas * (h + gy));
  c.setAttribute('aria-hidden', 'false');
  c.setAttribute('role', 'img');
  c.setAttribute('aria-label', municipios.pequenos + ' de los ' + municipios.total + ' municipios de la provincia de Granada tienen menos de 5.000 habitantes');
  const g = svg('g', { color: '#004C59' });
  for (let i = 0; i < municipios.total; i++) {
    const x = (i % cols) * (w + gx) + 1;
    const y = Math.floor(i / cols) * (h + gy) + 1;
    const pequeno = i < municipios.pequenos;
    modulo(g, x, y, w, h, pequeno ? 1 : 0, { clase: 'anomalia', trazo: pequeno ? 'anomalia-trazo' : '', i });
  }
  c.appendChild(g);
  s.append(c);
  const fig = el('p', 'celda fig');
  fig.style.cssText = '--c:5;--f:6;--ac:7;top:770px;padding-left:70px';
  fig.textContent = 'fig. 04a · ' + municipios.pequenos + ' de ' + municipios.total + ' municipios de Granada tienen menos de 5.000 habitantes · ' + municipios.fuente;
  s.append(fig);

  const tres = el('ol', 'celda v-tres');
  d.dimensiones.forEach((x) => {
    const li = el('li');
    li.append(el('strong', null, x.titulo), el('span', null, x.texto));
    tres.append(li);
  });
  s.append(tres);
  return s;
}

// 6 · Impacto: radiación concéntrica desde el evento (Wong, pp. 87-88).
// Cada anillo es un alcance; Granada 2031 es la anomalía.
function impacto(d) {
  const s = lamina('06', d.etiqueta, true);
  s.append(el('h2', 'celda grande i-titulo', d.titular));
  const lista = el('ol', 'celda i-lista');
  d.impactos.forEach((x, i) => {
    const li = el('li', x.tipo === 'Granada 2031' ? 'es-anomalia' : '');
    li.append(el('span', 'fig', 'fig. 0' + (i + 1)), el('strong', null, x.tipo), el('span', null, x.texto));
    lista.append(li);
  });
  s.append(lista);

  const W = 980, H = 870;
  const c = lienzo(120 + 5 * 140 + 120, 120 + 30, W, H);
  const g = svg('g', { color: '#F6F3EE' });
  const anillos = d.impactos.length;
  for (let i = anillos - 1; i >= 0; i--) {
    const w = 220 + i * 190;
    const h = 300 + i * 175;
    const x = (W - w) / 2;
    const y = H - h - 2;
    const esG = d.impactos[i].tipo === 'Granada 2031';
    g.appendChild(svg('path', { d: arco(x, y + 4, w, h - 4), class: 'anillo' + (esG ? ' anillo--anomalia' : '') }));
    const t = svg('text', { x: W / 2, y: y + 52, 'text-anchor': 'middle', class: 'anillo-nombre' + (esG ? ' anillo-nombre--anomalia' : '') });
    t.textContent = d.impactos[i].tipo;
    g.appendChild(t);
  }
  // El centro: el evento, con su agua
  modulo(g, W / 2 - 60, H - 182, 120, 180, 0.55, { clase: 'anomalia' });
  const ev = svg('text', { x: W / 2, y: H - 200, 'text-anchor': 'middle', class: 'anillo-nombre' });
  ev.textContent = 'La fiesta';
  g.appendChild(ev);
  c.appendChild(g);
  s.append(c);
  return s;
}

const MUNICIPIOS = { total: 174, pequenos: 133, fuente: 'recuento sobre el censo de 2024' };

const expo = await datos('exposicion');
const por = (id) => expo.diapositivas.find((x) => x.id === id);
const muestra = document.getElementById('muestra');
muestra.append(portada(por('identidad')), valor(por('valor'), MUNICIPIOS), impacto(por('impacto')));

// Ajusta la escala al ancho de la ventana
const escalar = () => document.documentElement.style.setProperty('--escala', Math.min(1, (window.innerWidth - 48) / 1920).toFixed(4));
escalar();
window.addEventListener('resize', escalar);
