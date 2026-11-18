// Muestra de la gramática del aljibe (docs/directrices-diseno.md), segunda
// versión: tres diapositivas con el contenido real de datos/exposicion.json.
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

function lamina(numero, seccion, clase = '') {
  const s = el('section', 'lamina ' + clase);
  s.setAttribute('aria-label', numero + ' · ' + seccion);
  s.append(el('div', 'reticula'));
  return s;
}

// 1 · Portada: el lema es la imagen. Cada palabra cae en una fila de la
// retícula, empujada a un borde, con su número de figura (referencia 1)
function portada(d) {
  const s = lamina('01', d.etiqueta, 'lamina--noche grano');
  const filas = el('div', 'p-filas');
  filas.setAttribute('aria-hidden', 'true');
  const lineas = [['Convertimos', 'los'], ['datos', 'de la'], ['cultura', 'en'], ['', 'decisiones.']];
  let n = 0;
  lineas.forEach((par, f) => {
    const fila = el('div', 'p-fila');
    fila.style.top = f * 180 + 80 + 'px';
    par.forEach((palabra, i) => {
      const p = el('span', 'p-palabra display' + (i === 0 ? ' p-palabra--izq' : ''), palabra);
      if (palabra) p.append(el('sup', 'num', '(' + String(++n).padStart(2, '0') + ')'));
      fila.append(p);
    });
    filas.append(fila);
  });
  const h1 = el('h1', null, d.titular);
  h1.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
  const centro = el('div', 'p-centro');
  centro.append(el('p', null, d.pregunta), el('p', 'etq', '(01) ' + d.etiqueta));
  const pie = el('div', 'p-pie');
  pie.append(el('p', null, d.propuesta + ' Como los aljibes del Albaicín recogían el agua y la repartían, recogemos los datos de la cultura y los devolvemos como decisiones.'), el('p', 'etq', d.pie));
  pie.lastChild.style.marginTop = '14px';
  const logo = el('img', 'p-logo');
  logo.src = '../logos/aljibe-lockup-inverse.svg';
  logo.alt = 'ALJIBE';
  s.append(h1, filas, centro, pie, logo);
  return s;
}

// 4 · Propuesta de valor: bloques de color con módulos (referencia 4).
// Repetición del arco y una sola anomalía: el arco lleno en agua.
function valor(d, municipios) {
  const s = lamina('04', d.etiqueta);
  const b = el('div', 'bloques');

  const t = el('div', 'bloque b-titular');
  const tl = el('p', 'b-etq etq');
  tl.append(el('span', null, '(04) ' + d.etiqueta), el('span', null, 'fig. 04a'));
  const tres = el('ol', 'b-tres');
  d.dimensiones.forEach((x) => {
    const li = el('li');
    li.append(el('strong', null, x.titulo), el('span', null, x.texto));
    tres.append(li);
  });
  t.append(tl, el('h2', 'display', d.titular), tres);

  // Columna de arcos: repetición con una anomalía (Wong, pp. 51 y 99)
  const a = el('div', 'bloque b-arcos');
  const lien = svg('svg', { viewBox: '0 0 640 540', width: 640, height: 540, 'aria-hidden': 'true' });
  const cols = 4, w = 120, h = 160, gx = 32, x0 = 40, y0 = 40;
  for (let f = 0; f < 3; f++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * (w + gx), y = y0 + f * (h + 10);
      const anom = f === 2 && c === 1;
      const lleno = (f + c) % 2 === 0;
      lien.appendChild(svg('path', { d: arco(x, y, w, h), fill: anom ? '#2E8C9C' : lleno ? '#004C59' : 'none', stroke: '#004C59', 'stroke-width': 3, class: lleno || anom ? 'sube' : '' }));
    }
  }
  a.append(lien);

  const c = el('div', 'bloque b-cifra');
  const cl = el('p', 'b-etq etq');
  cl.append(el('span', null, 'fig. 04b'), el('span', null, municipios.fuente));
  c.append(cl, el('p', 'gigante display num', String(municipios.pequenos)), el('p', null, 'de los ' + municipios.total + ' municipios de Granada tienen menos de 5.000 habitantes.'));

  const p = el('div', 'bloque b-pueblos');
  const pl = el('p', 'b-etq etq');
  pl.append(el('span', null, d.clave.etiqueta), el('span', null, 'fig. 04c'));
  const cuerpo = el('div');
  cuerpo.append(el('p', 'gigante display', d.clave.titulo), el('p', null, d.clave.texto));
  cuerpo.lastChild.style.marginTop = '28px';
  p.append(pl, cuerpo, el('p', 'b-pie', d.pie));

  b.append(t, a, c, p);
  s.append(b);
  return s;
}

// 6 · Impacto: la cifra «2031» troceada en formas del sistema (referencia 5).
// Cada dígito, un color de la marca; el arco del aljibe corta el conjunto.
function impacto(d) {
  const s = lamina('06', d.etiqueta);
  s.style.background = '#ECEEEA';
  const txt = el('div', 'i-texto');
  const lista = el('ol', 'i-lista');
  d.impactos.forEach((x, i) => {
    const li = el('li', x.tipo === 'Granada 2031' ? 'es-anomalia' : '');
    li.append(el('span', 'etq', '(0' + (i + 1) + ')'), el('strong', null, x.tipo), el('span', null, x.texto));
    lista.append(li);
  });
  txt.append(el('p', 'etq', '(06) ' + d.etiqueta), el('h2', 'display', d.titular), lista);

  const W = 860, H = 960;
  const c = svg('svg', { class: 'i-cifra', viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': 'Granada 2031' });
  const defs = svg('defs');
  // Los dígitos se recortan en dos mitades para que parezcan piezas
  const piezas = [
    { t: '2', x: 0, y: 440, color: '#10262B' },
    { t: '0', x: 430, y: 440, color: '#004C59' },
    { t: '3', x: 0, y: 920, color: '#2E8C9C' },
    { t: '1', x: 430, y: 920, color: '#10262B' }
  ];
  piezas.forEach((p, i) => {
    const id = 'corte' + i;
    const cp = svg('clipPath', { id });
    cp.appendChild(svg('rect', { x: p.x, y: p.y - 470 + (i % 2 ? 0 : 60), width: 430, height: i % 2 ? 470 : 410 }));
    defs.appendChild(cp);
    const tx = svg('text', { x: p.x + 10, y: p.y, fill: p.color, 'font-family': 'Gloock, Georgia, serif', 'font-size': 560, 'clip-path': `url(#${id})` });
    tx.textContent = p.t;
    c.appendChild(tx);
  });
  c.prepend(defs);
  // El arco del aljibe, en contorno, superpuesto (interrelación: superposición, Wong p. 49)
  c.appendChild(svg('path', { d: arco(470, 60, 330, 420), fill: 'none', stroke: '#2E8C9C', 'stroke-width': 26 }));
  // Un bloque de agua como anomalía, a media altura
  c.appendChild(svg('rect', { x: 250, y: 860, width: 260, height: 70, fill: '#CFE6EA', class: 'sube' }));

  s.append(txt, c, el('p', 'i-vertical num', 'Granada · Capital Europea de la Cultura 2031'));
  return s;
}

const MUNICIPIOS = { total: 174, pequenos: 133, fuente: 'recuento sobre el censo de 2024' };

const expo = await datos('exposicion');
const por = (id) => expo.diapositivas.find((x) => x.id === id);
const muestra = document.getElementById('muestra');
muestra.append(portada(por('identidad')), valor(por('valor'), MUNICIPIOS), impacto(por('impacto')));

const escalar = () => document.documentElement.style.setProperty('--escala', Math.min(1, (window.innerWidth - 48) / 1920).toFixed(4));
escalar();
window.addEventListener('resize', escalar);
