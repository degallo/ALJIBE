// Radar semanal de asistencia: Fiesta del Vino 2027
import { iniciarMarco, listo, mostrarError } from '../marco.js';
import { datos } from '../nucleo/api.js';
import { el, icono, svg } from '../nucleo/dom.js';
import { numero, porcentaje, conSigno, leerFecha } from '../nucleo/formato.js';

iniciarMarco();

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const corta = (iso) => { const f = leerFecha(iso); return f.getUTCDate() + ' ' + MESES[f.getUTCMonth()]; };

function dato(etiqueta, valor, nota, clase = '') {
  const d = el('div', 'dato luz ' + clase);
  d.dataset.revelar = '';
  const v = el('span', 'dato__valor');
  if (typeof valor === 'string') v.textContent = valor; else v.append(...valor);
  d.append(el('span', 'dato__etiqueta', etiqueta), v);
  if (nota) d.appendChild(el('span', 'dato__nota', nota));
  return d;
}

function pintarKpis(r, fiesta) {
  const actual = r.semanas.find((s) => s.semana === r.semanaActual);
  const final = r.semanas[r.semanas.length - 1];
  const asis = (i) => Math.round((i / r.equivalencia.indice) * r.equivalencia.asistentes / 100) * 100;
  const cont = document.getElementById('kpis-radar');
  cont.append(
    dato('Índice de esta semana', String(actual.real), conSigno(r.resumen.variacion, 'numero') + ' % ' + r.resumen.texto, 'dato--oscuro'),
    dato('Semanas para la fiesta', String(-r.semanaActual), 'Hasta el sábado 20 de febrero'),
    dato('Previsión para el día', numero(asis(final.prevision)), 'Rango ' + numero(fiesta.prevision.minimo) + '–' + numero(fiesta.prevision.maximo)),
    dato('Próximo paso', '11 ene', 'Arranca la campaña digital (semana −6)')
  );
}

function pintarGrafico(r) {
  const W = 1040, H = 380, IZQ = 40, DER = 24, ARR = 20, ABA = 40;
  const n = r.semanas.length;
  const x = (i) => IZQ + (i * (W - IZQ - DER)) / (n - 1);
  const y = (v) => ARR + (1 - v / 125) * (H - ARR - ABA);
  const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'grafico', role: 'img',
    'aria-label': 'Índice de intención por semana. 2026 como referencia, 2027 real hasta la semana ' + r.semanaActual + ' y previsión con rango hasta la fiesta.' });
  for (const v of [0, 25, 50, 75, 100, 125]) {
    s.appendChild(svg('line', { x1: IZQ, x2: W - DER, y1: y(v), y2: y(v), stroke: v ? '#ECEEEB' : '#D5DAD6' }));
    const t = svg('text', { x: 0, y: y(v) + 4 }); t.textContent = v; s.appendChild(t);
  }
  r.semanas.forEach((w, i) => {
    if (i % 4 === 0 || i === n - 1) {
      const t = svg('text', { x: x(i), y: H - 12, 'text-anchor': 'middle' });
      t.textContent = i === n - 1 ? '20 feb' : corta(w.fecha);
      s.appendChild(t);
    }
  });
  // Banda de previsión
  const prev = r.semanas.map((w, i) => ({ ...w, i })).filter((w) => w.prevision != null);
  const ultimoReal = r.semanas.filter((w) => w.real != null).map((w, i) => ({ ...w, i })).pop();
  const arriba = prev.map((w) => x(w.i) + ',' + y(w.max)).join(' ');
  const abajo = prev.slice().reverse().map((w) => x(w.i) + ',' + y(w.min)).join(' ');
  s.appendChild(svg('polygon', { points: x(ultimoReal.i) + ',' + y(ultimoReal.real) + ' ' + arriba + ' ' + abajo, fill: 'rgba(207,230,234,0.7)' }));
  // Campaña
  const iCamp = r.semanas.findIndex((w) => w.semana === -6);
  s.appendChild(svg('line', { x1: x(iCamp), x2: x(iCamp), y1: ARR, y2: H - ABA, stroke: '#4E6368', 'stroke-dasharray': '3 4' }));
  const tc = svg('text', { x: x(iCamp) + 6, y: ARR + 10 }); tc.textContent = 'Campaña'; s.appendChild(tc);
  // 2026
  s.appendChild(svg('polyline', { points: r.semanas.map((w, i) => x(i) + ',' + y(w.anterior)).join(' '), fill: 'none', stroke: '#4E6368', 'stroke-width': 2, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round' }));
  // Previsión central
  s.appendChild(svg('polyline', { points: x(ultimoReal.i) + ',' + y(ultimoReal.real) + ' ' + prev.map((w) => x(w.i) + ',' + y(w.prevision)).join(' '), fill: 'none', stroke: '#2E8C9C', 'stroke-width': 2, 'stroke-dasharray': '6 5' }));
  // 2027 real
  const real = r.semanas.map((w, i) => ({ ...w, i })).filter((w) => w.real != null);
  const lineaReal = svg('polyline', { points: real.map((w) => x(w.i) + ',' + y(w.real)).join(' '), fill: 'none', stroke: '#004C59', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  s.appendChild(lineaReal);
  s.appendChild(svg('circle', { cx: x(ultimoReal.i), cy: y(ultimoReal.real), r: 6, fill: '#004C59', stroke: '#fff', 'stroke-width': 2 }));
  const th = svg('text', { x: x(ultimoReal.i), y: y(ultimoReal.real) - 14, 'text-anchor': 'middle', style: 'fill:#004C59;font-weight:600' }); th.textContent = 'Hoy'; s.appendChild(th);
  const fin = prev[prev.length - 1];
  s.appendChild(svg('circle', { cx: x(fin.i), cy: y(fin.prevision), r: 5, fill: '#CFE6EA', stroke: '#2E8C9C', 'stroke-width': 2 }));

  // Zonas interactivas por semana
  const caja = document.getElementById('grafico-radar');
  const burbuja = el('span', 'burbuja');
  burbuja.hidden = true;
  r.semanas.forEach((w, i) => {
    const g = svg('g', { class: 'punto-grafico', tabindex: 0, role: 'img' });
    const texto = 'Semana ' + w.semana + ' (' + corta(w.fecha) + '): 2026 ' + w.anterior + (w.real != null ? ' · 2027 ' + w.real : ' · previsión ' + w.prevision + ' (' + w.min + '–' + w.max + ')');
    g.setAttribute('aria-label', texto);
    g.appendChild(svg('rect', { x: x(i) - 11, y: ARR, width: 22, height: H - ARR - ABA, fill: 'transparent', class: 'diana' }));
    const mostrar = () => {
      burbuja.textContent = texto;
      burbuja.style.left = Math.min(80, Math.max(20, (x(i) / W) * 100)) + '%';
      burbuja.style.top = (y(w.real ?? w.prevision ?? w.anterior) / H) * 100 + '%';
      burbuja.hidden = false;
    };
    g.addEventListener('pointerenter', mostrar);
    g.addEventListener('focus', mostrar);
    g.addEventListener('pointerleave', () => { burbuja.hidden = true; });
    g.addEventListener('blur', () => { burbuja.hidden = true; });
    s.appendChild(g);
  });
  caja.append(s, burbuja);

  const ley = document.getElementById('leyenda-radar');
  const item = (estilo, texto) => { const sp = el('span'); const i = el('i'); i.style.cssText = estilo; sp.append(i, texto); ley.appendChild(sp); };
  item('background:#004C59', '2027');
  item('width:16px;height:0;border-radius:0;background:none;border-top:2px dashed #2E8C9C', 'Previsión');
  item('width:16px;height:0;border-radius:0;background:none;border-top:2px dotted #4E6368', '2026');
  document.getElementById('nota-radar').textContent = r.equivalencia.texto + '. Actualizado el ' + corta(r.actualizado) + '.';
}

function pintarComponentes(r) {
  const cont = document.getElementById('componentes');
  const max = Math.max(...r.componentes.map((c) => Math.abs(c.variacion))) * 1.2;
  for (const c of r.componentes) {
    const fila = el('div', 'componente');
    const nombre = el('span', null, c.nombre);
    nombre.appendChild(el('span', 'componente__peso', 'Peso ' + porcentaje(c.peso)));
    const pista = el('span', 'componente__pista');
    pista.setAttribute('aria-hidden', 'true');
    const barra = el('span', 'componente__barra' + (c.variacion < 0 ? ' componente__barra--baja' : ''));
    const ancho = (Math.abs(c.variacion) / max) * 50;
    if (c.variacion >= 0) barra.style.left = '50%'; else barra.style.right = '50%';
    barra.style.width = ancho + '%';
    pista.appendChild(barra);
    const v = el('span', 'componente__valor', (c.variacion >= 0 ? '+' : '−') + Math.abs(c.variacion) + ' %');
    if (c.variacion < 0) v.style.color = '#8F3F12';
    fila.append(nombre, pista, v);
    cont.appendChild(fila);
  }
}

const ICONO_ALERTA = { bien: 'sube', atencion: 'alerta', plan: 'calendario' };

function pintarAlertas(r) {
  const ul = document.getElementById('alertas');
  for (const a of r.alertas) {
    const li = el('li', 'alerta-item alerta-item--' + a.tipo);
    li.dataset.revelar = '';
    const ic = el('span', 'alerta-item__icono');
    ic.appendChild(icono(ICONO_ALERTA[a.tipo]));
    const tx = el('div');
    tx.append(el('strong', null, a.titulo), el('p', null, a.texto));
    li.append(ic, tx);
    ul.appendChild(li);
  }
  const ol = document.getElementById('metodo');
  r.metodologia.forEach((t, i) => { const li = el('li'); li.append(el('span', null, String(i + 1).padStart(2, '0')), t); ol.appendChild(li); });
}

Promise.all([datos('radar'), datos('fiesta-2027')])
  .then(([r, fiesta]) => {
    pintarKpis(r, fiesta);
    pintarGrafico(r);
    pintarComponentes(r);
    pintarAlertas(r);
    listo();
  })
  .catch(mostrarError);
