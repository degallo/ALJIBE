// Cuadro de mando de la Fiesta del Vino 2027
import { iniciarMarco, listo, mostrarError } from '../marco.js';
import { datos } from '../nucleo/api.js';
import { el, icono, svg, raiz } from '../nucleo/dom.js';
import { numero } from '../nucleo/formato.js';

iniciarMarco();

const TONOS = ['marca', 'agua', 'arena', 'calido'];
let fiesta;
let elegida;

function pintarResumen() {
  const f = fiesta;
  const h1 = document.getElementById('titulo');
  // Titular que afirma: la fecha recomendada y la asistencia prevista
  const rec = f.fechas.find((x) => x.id === f.fechaRecomendada.dia) || f.fechas[0];
  const conclusion = 'El ' + rec.dia.toLowerCase() + ' de ' + rec.mes + ', ' + numero(f.prevision.central) + ' personas.';
  h1.append(f.titulo, document.createElement('br'), el('span', null, conclusion));
  document.getElementById('chip-edicion').append(f.municipio + ' · ' + f.edicion, icono('abajo', 'ico ico--s'));
  const p = f.prevision;
  document.getElementById('prevision-central').textContent = numero(p.central);
  const v = document.getElementById('prevision-variacion');
  v.append(p.variacion + ' ', el('span', null, p.referencia));
  document.getElementById('prevision-etiqueta').textContent = p.etiqueta;
  document.getElementById('prevision-rango').textContent = 'Rango ' + numero(p.minimo) + '–' + numero(p.maximo);

  // Barra de rango: tres tramos y la marca del valor central
  const pos = (x) => ((x - p.escalaMin) / (p.escalaMax - p.escalaMin)) * 100;
  const rango = document.getElementById('rango');
  rango.setAttribute('aria-label', 'Rango de la previsión: entre ' + numero(p.minimo) + ' y ' + numero(p.maximo) + ', valor central ' + numero(p.central));
  const barra = el('div', 'rango__barra');
  const tramos = [[pos(p.minimo), '#F1E3DA'], [pos(p.maximo) - pos(p.minimo), '#CFE6EA'], [100 - pos(p.maximo), '#E6DFD3']];
  for (const [ancho, color] of tramos) {
    const s = el('span');
    s.style.flex = String(Math.round(ancho));
    s.style.background = color;
    barra.appendChild(s);
  }
  const c = pos(p.central);
  const marca = el('span', 'rango__marca');
  marca.style.left = c + '%';
  const punto = el('span', 'rango__punto');
  punto.style.left = 'calc(' + c + '% + 10px)';
  barra.append(marca, punto);
  const eje = el('div', 'rango__eje');
  const etiquetas = [[p.escalaMin, 0], [p.minimo, pos(p.minimo) - 1], [p.central, c - 2, 'actual'], [p.maximo, pos(p.maximo) - 1.5]];
  for (const [valor, x, clase] of etiquetas) {
    const s = el('span', clase || null, numero(valor));
    s.style.left = x + '%';
    eje.appendChild(s);
  }
  rango.append(barra, eje);

  const fr = document.getElementById('fecha-rec');
  fr.append(f.fechaRecomendada.dia, el('small', null, ' ' + f.fechaRecomendada.mes));
  document.getElementById('fecha-rec-puntos').textContent = f.fechaRecomendada.puntos + '/100';
  document.getElementById('vasos').textContent = numero(f.vasos.cantidad);
  const nota = document.getElementById('vasos-nota');
  f.vasos.nota.forEach((t, i) => { if (i) nota.appendChild(document.createElement('br')); nota.append(t); });

  // Buscador de otros eventos
  const otros = [
    { nombre: 'Fiesta del Vino · Alhama de Granada', href: 'fiesta-del-vino.html' },
    { nombre: 'Festival de verano · ejemplo', href: 'decisiones.html?caso=festival' },
    { nombre: 'Sala de conciertos · ejemplo', href: 'entregables/sala.html' }
  ];
  const lista = document.getElementById('lista-eventos');
  otros.forEach((o) => { const op = el('option'); op.value = o.nombre; lista.appendChild(op); });
  const form = document.getElementById('buscador');
  const entrada = document.getElementById('buscar-evento');
  const aviso = document.getElementById('buscador-error');
  const ir = () => {
    const q = entrada.value.trim().toLowerCase();
    if (!q) return;
    const hallado = otros.find((o) => o.nombre.toLowerCase().includes(q));
    if (hallado) location.href = raiz() + hallado.href;
    else aviso.textContent = 'No hay ningún cuadro de mando con ese nombre. Prueba con «sala» o «festival».';
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); ir(); });
  entrada.addEventListener('change', ir);
  entrada.addEventListener('input', () => { aviso.textContent = ''; });
}

function pintarFechas() {
  document.getElementById('n-fechas').textContent = fiesta.fechas.length;
  document.getElementById('n-ediciones').textContent = fiesta.historico.ediciones.length;
  document.getElementById('n-impacto').textContent = fiesta.impacto.length;
  const cont = document.getElementById('lista-fechas');
  fiesta.fechas.forEach((f, i) => {
    const b = el('button', 'opcion fecha-card luz tono-' + TONOS[i]);
    b.type = 'button';
    b.dataset.id = f.id;
    b.dataset.revelar = '';
    b.setAttribute('aria-pressed', String(f.id === elegida));
    b.setAttribute('aria-label', f.dia + ' de ' + f.mes + ', puesto ' + (i + 1) + ', ' + f.puntos + ' puntos de 100, asistencia prevista ' + numero(f.asis));
    const cab = el('span', 'opcion__cab');
    const izq = el('span', 'fila');
    const dia = el('span', 'fecha-card__dia');
    dia.append(f.dia, document.createElement('br'), f.mes);
    izq.append(el('span', 'fecha-card__puesto', String(i + 1)), dia);
    const fl = el('span', 'flecha');
    fl.appendChild(icono('flecha'));
    cab.append(izq, fl);
    const cifra = el('span', 'pila');
    cifra.style.gap = '2px';
    const etq = el('span', null, 'Asistencia prevista');
    etq.style.cssText = 'font-size:13px;line-height:18px';
    cifra.append(etq, el('span', 'fecha-card__cifra', numero(f.asis)));
    const pie = el('span', 'fecha-card__pie');
    pie.append(el('span', null, f.resumen), el('span', 'mono', f.puntos + '/100'));
    b.append(cab, cifra, pie);
    b.addEventListener('click', () => elegir(f.id));
    cont.appendChild(b);
  });
}

function elegir(id) {
  elegida = id;
  document.querySelectorAll('#lista-fechas .opcion').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
  pintarPanel();
}

function pintarPanel() {
  const f = fiesta.fechas.find((x) => x.id === elegida);
  const panel = document.getElementById('panel-fecha');
  panel.textContent = '';
  const cab = el('div', 'fila');
  cab.style.gap = '14px';
  const ic = el('span', 'icono-redondo');
  ic.appendChild(icono('calendario'));
  cab.append(ic, el('h2', 'oscuro__titulo', f.dia + ' de ' + f.mes));
  const cifra = el('div', 'pila');
  cifra.style.gap = '4px';
  cifra.append(el('span', 'oscuro__etiqueta', 'Asistencia prevista'), el('span', 'oscuro__cifra', numero(f.asis)));
  const filas = el('div', 'oscuro__filas');
  for (const [k, v] of [['Probabilidad de lluvia', f.lluvia], ['Eventos que compiten', f.comp], ['Festivos', f.fest]]) {
    const fila = el('div', 'oscuro__fila');
    fila.append(el('span', null, k), el('span', 'mono', v));
    filas.appendChild(fila);
  }
  const nota = el('p', 'oscuro__suave', f.nota);
  nota.style.cssText = 'font-size:14px;line-height:21px';

  const camp = el('div', 'pila');
  camp.style.gap = '12px';
  const meses = el('div', 'campana');
  fiesta.campana.meses.forEach((m) => {
    const s = el('span', 'campana__mes' + (m.activo ? ' campana__mes--activo' : ''));
    const marca = el('span', 'campana__marca');
    if (m.activo) marca.appendChild(icono('check'));
    s.append(m.mes, marca);
    s.setAttribute('aria-label', m.mes + (m.activo ? ': campaña activa' : ': sin campaña'));
    meses.appendChild(s);
  });
  const notaCamp = el('span', 'oscuro__suave', fiesta.campana.nota);
  notaCamp.style.cssText = 'font-size:13px;line-height:18px';
  camp.append(el('span', 'oscuro__etiqueta', fiesta.campana.titulo), meses, notaCamp);

  const descarga = el('a', 'boton-claro');
  descarga.href = 'entregables/informe-pleno.html';
  descarga.append(icono('descarga'), 'Descargar informe');
  panel.append(cab, cifra, filas, nota, camp, descarga);
}

// Histórico: mismo dibujo que el diseño (viewBox 580 × 240)
function pintarHistorico() {
  const h = fiesta.historico;
  const ed = h.ediciones;
  const X0 = 67, PASO = 37;
  const y = (v) => 200 - v / 50;
  const ultimo = ed[ed.length - 1];
  const prev = fiesta.prevision.central;
  const s = svg('svg', { viewBox: '0 0 580 240', class: 'grafico', role: 'img',
    'aria-label': 'Asistencia de ' + ed[0].anio + ' a ' + ultimo.anio + ', de ' + numero(ed[0].asistentes) + ' a ' + numero(ultimo.asistentes) + ' personas, con previsión de ' + numero(prev) + ' en ' + fiesta.anio });
  const ejes = svg('g');
  for (const [yy, t] of [[140, '3k'], [80, '6k'], [20, '9k']]) {
    ejes.appendChild(svg('line', { x1: 40, y1: yy, x2: 570, y2: yy, stroke: '#ECEEEB' }));
    const tx = svg('text', { x: 0, y: yy + 4 }); tx.textContent = t; ejes.appendChild(tx);
  }
  ejes.appendChild(svg('line', { x1: 40, y1: 200, x2: 570, y2: 200, stroke: '#D5DAD6' }));
  const cero = svg('text', { x: 0, y: 204 }); cero.textContent = '0'; ejes.appendChild(cero);
  ed.forEach((e, i) => {
    if (h.etiquetasEje.includes(e.anio)) {
      const t = svg('text', { x: X0 + i * PASO - 11, y: 224 }); t.textContent = e.anio; ejes.appendChild(t);
    }
  });
  s.appendChild(ejes);

  const puntos = ed.map((e, i) => (X0 + i * PASO) + ',' + y(e.asistentes)).join(' ');
  const linea = svg('polyline', { points: puntos, fill: 'none', stroke: '#10262B', 'stroke-width': 2, 'stroke-linejoin': 'round', class: 'dibujar' });
  s.appendChild(linea);

  const xp = X0 + ed.length * PASO;
  const xu = X0 + (ed.length - 1) * PASO;
  s.appendChild(svg('line', { x1: xu, y1: y(ultimo.asistentes), x2: xp, y2: 48, stroke: '#2E8C9C', 'stroke-width': 2, 'stroke-dasharray': '4 4' }));
  s.appendChild(svg('line', { x1: xp, y1: 72, x2: xp, y2: 196, stroke: '#10262B', 'stroke-width': 1, 'stroke-dasharray': '3 4' }));
  s.appendChild(svg('path', { d: `M${xp - 6} 200 L${xp} 190 L${xp + 6} 200 Z`, fill: '#10262B' }));
  s.appendChild(svg('circle', { cx: xp, cy: 48, r: 23, fill: '#CFE6EA', stroke: '#2E8C9C', 'stroke-width': 2 }));
  const k = svg('text', { x: xp, y: 52, 'text-anchor': 'middle', style: 'font-family: var(--sans); font-size: 13px; font-weight: 600; fill: #004C59' });
  k.textContent = numero(prev / 1000, 1) + 'k';
  s.appendChild(k);
  const anio = svg('text', { x: xp, y: 224, 'text-anchor': 'middle', style: 'fill: #10262B' });
  anio.textContent = fiesta.anio;
  s.appendChild(anio);

  // Anotaciones: lo que explica la curva sin tener que contarlo de palabra
  for (const a of h.anotaciones || []) {
    const i = ed.findIndex((e) => e.anio === a.anio);
    if (i >= 0) {
      // Un año con dato: anillo en su punto y texto debajo, a la izquierda
      const cx = X0 + i * PASO, cy = y(ed[i].asistentes);
      s.appendChild(svg('circle', { cx, cy, r: 6, fill: 'none', stroke: a.tipo === 'caida' ? '#B4521A' : '#10262B', 'stroke-width': 1.5 }));
      const t = svg('text', { x: cx - 8, y: cy + 30, 'text-anchor': 'end', style: 'font-family: var(--sans); font-size: 11px; font-weight: 600; fill: ' + (a.tipo === 'caida' ? '#B4521A' : '#10262B') });
      t.textContent = a.texto;
      s.appendChild(t);
    } else {
      // Un año sin edición: marca entre los años vecinos
      const j = ed.findIndex((e) => e.anio > a.anio);
      if (j <= 0) continue;
      const xm = X0 + (j - 0.5) * PASO, ym = (y(ed[j - 1].asistentes) + y(ed[j].asistentes)) / 2;
      s.appendChild(svg('line', { x1: xm, x2: xm, y1: ym + 8, y2: ym + 18, stroke: '#4E6368', 'stroke-width': 1.5 }));
      const t = svg('text', { x: xm, y: ym + 32, 'text-anchor': 'middle', style: 'font-family: var(--sans); font-size: 11px; font-weight: 600; fill: #4E6368' });
      t.textContent = a.texto;
      s.appendChild(t);
    }
  }

  // Puntos: visibles los del diseño; todos con objetivo táctil y título
  const contenedor = document.getElementById('grafico-historico');
  contenedor.style.position = 'relative';
  const burbuja = el('span', 'burbuja');
  burbuja.hidden = true;
  ed.forEach((e, i) => {
    const g = svg('g', { class: 'punto-grafico', tabindex: 0, role: 'img', 'aria-label': e.anio + ': ' + numero(e.asistentes) + ' asistentes' });
    const cx = X0 + i * PASO, cy = y(e.asistentes);
    g.appendChild(svg('circle', { class: 'diana', cx, cy, r: 12 }));
    if (h.puntosVisibles.includes(e.anio)) g.appendChild(svg('circle', { class: 'visible', cx, cy, r: 3, fill: '#10262B' }));
    const mostrar = () => {
      burbuja.textContent = e.anio + ' · ' + numero(e.asistentes);
      burbuja.style.left = (cx / 580 * 100) + '%';
      burbuja.style.top = (cy / 240 * 100) + '%';
      burbuja.hidden = false;
    };
    g.addEventListener('pointerenter', mostrar);
    g.addEventListener('focus', mostrar);
    g.addEventListener('pointerleave', () => { burbuja.hidden = true; });
    g.addEventListener('blur', () => { burbuja.hidden = true; });
    s.appendChild(g);
  });
  contenedor.append(s, burbuja);
  requestAnimationFrame(() => linea.style.setProperty('--largo', Math.ceil(linea.getTotalLength())));
  document.getElementById('nota-historico').textContent = h.nota;
}

function pintarImpacto() {
  const cont = document.getElementById('impacto');
  fiesta.impacto.forEach((x) => {
    const a = el('article', 'luz');
    a.dataset.revelar = '';
    const v = el('span', 'impacto__valor');
    const n = el('span', null, numero(x.valor));
    if (x.valor >= 100) n.dataset.contar = '';
    v.appendChild(n);
    if (x.unidad) v.appendChild(el('small', null, ' ' + x.unidad));
    a.append(el('h3', null, x.nombre), v);
    cont.appendChild(a);
  });
  const ol = document.getElementById('lista-metodo');
  fiesta.metodologia.forEach((t, i) => {
    const li = el('li');
    li.append(el('span', null, String(i + 1).padStart(2, '0')), t);
    ol.appendChild(li);
  });
}

datos('fiesta-2027')
  .then((d) => {
    fiesta = d;
    elegida = d.fechas[0].id;
    pintarResumen();
    pintarFechas();
    pintarPanel();
    pintarHistorico();
    pintarImpacto();
    listo();
  })
  .catch(mostrarError);
