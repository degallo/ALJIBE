// Suscripción esencial: cuadro de mando automático de una sala de conciertos
import { iniciarMarco, listo, mostrarError } from '../marco.js';
import { datos } from '../nucleo/api.js';
import { el, icono, svg } from '../nucleo/dom.js';
import { conUnidad, diferencia, fechaLarga, numero, porcentaje, leerFecha } from '../nucleo/formato.js';

iniciarMarco();

const DIAS = { martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado' };
const corta = (iso) => { const f = leerFecha(iso); return f.getUTCDate() + '/' + (f.getUTCMonth() + 1); };

function pintarKpis(s) {
  const cont = document.getElementById('kpis-sala');
  s.kpis.forEach((k, i) => {
    const mas = k.sentido === 'mas';
    const ok = mas ? k.valor >= k.objetivo : k.valor <= k.objetivo;
    // El primer indicador es el protagonista de la pantalla
    const a = el('article', 'kpi luz' + (i === 0 ? ' kpi--principal' : ''));
    a.dataset.revelar = '';
    const objetivo = el('div', 'kpi__objetivo');
    objetivo.append(el('span', null, 'Objetivo'), el('strong', null, conUnidad(k.objetivo, k.tipo)));
    a.append(
      el('h2', 'kpi__nombre', k.nombre),
      el('span', 'kpi__previsto', conUnidad(k.valor, k.tipo)),
      objetivo,
      ok ? el('span', 'estado estado--ok', 'Objetivo alcanzado') : el('span', 'estado estado--falta', 'Faltan ' + diferencia(Math.abs(k.objetivo - k.valor), k.tipo))
    );
    cont.appendChild(a);
  });
}

function pintarOcupacion(s) {
  const W = 640, H = 240, ABA = 30, ARR = 14;
  const n = s.ultimos.length;
  const IZQ = 64; // margen para el eje y la etiqueta de la media
  const ancho = (W - IZQ) / n;
  const y = (v) => ARR + (1 - v / 100) * (H - ARR - ABA);
  const media = Math.round(s.ultimos.reduce((t, c) => t + c.ocupacion, 0) / n);
  const g = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'grafico', role: 'img', 'aria-label': 'Ocupación de los últimos ' + n + ' conciertos. Media del ' + media + ' %. Los martes se quedan por debajo del 45 %.' });
  for (const v of [0, 50, 100]) {
    g.appendChild(svg('line', { x1: IZQ, x2: W, y1: y(v), y2: y(v), stroke: v ? '#ECEEEB' : '#D5DAD6' }));
    const t = svg('text', { x: 0, y: y(v) + 4 }); t.textContent = v + '%'; g.appendChild(t);
  }
  s.ultimos.forEach((c, i) => {
    const x = IZQ + i * ancho + 6;
    const martes = c.dia === 'mar';
    const r = svg('rect', { x, y: y(c.ocupacion), width: ancho - 12, height: H - ABA - y(c.ocupacion), rx: 4, fill: martes ? '#10262B' : '#004C59', 'fill-opacity': martes ? 0.35 : 1 });
    const tt = svg('title'); tt.textContent = c.dia + ' ' + corta(c.fecha) + ': ' + c.ocupacion + ' %'; r.appendChild(tt);
    g.appendChild(r);
    const t = svg('text', { x: x + (ancho - 12) / 2, y: H - 10, 'text-anchor': 'middle' }); t.textContent = c.dia; g.appendChild(t);
    const v = svg('text', { x: x + (ancho - 12) / 2, y: y(c.ocupacion) - 5, 'text-anchor': 'middle' }); v.textContent = c.ocupacion; g.appendChild(v);
  });
  g.appendChild(svg('line', { x1: IZQ, x2: W, y1: y(media), y2: y(media), stroke: '#2E8C9C', 'stroke-width': 2, 'stroke-dasharray': '6 5' }));
  const tm = svg('text', { x: 0, y: y(media) + 4, style: 'fill:#004C59;font-weight:600' }); tm.textContent = 'Media ' + media; g.appendChild(tm);
  document.getElementById('grafico-ocupacion').appendChild(g);
  const martes = s.ultimos.filter((c) => c.dia === 'mar');
  const mediaMartes = Math.round(martes.reduce((t, c) => t + c.ocupacion, 0) / martes.length);
  document.getElementById('nota-ocupacion').textContent = 'Los martes llenan de media un ' + mediaMartes + ' %, ' + (media - mediaMartes) + ' puntos menos que la media de la sala.';
}

function pintarProximos(s) {
  const t = document.getElementById('tabla-proximos');
  const cab = el('thead');
  const tr = el('tr');
  for (const h of ['Fecha', 'Concierto', 'Vendidas', 'Esperadas hoy', 'Estado']) tr.appendChild(el('th', ['Esperadas hoy'].includes(h) ? 'num' : null, h));
  cab.appendChild(tr);
  const cuerpo = el('tbody');
  const alertas = [];
  for (const c of s.proximos) {
    const ritmo = c.vendidas / c.esperadas;
    const fila = el('tr');
    const venta = el('td', 'venta');
    const barra = el('div', 'progreso-barra');
    barra.setAttribute('aria-hidden', 'true');
    const relleno = el('span');
    relleno.style.setProperty('--v', (c.vendidas / s.aforo) * 100 + '%');
    if (ritmo < 0.8) relleno.style.background = 'var(--alerta)';
    barra.appendChild(relleno);
    venta.append(el('span', 'mono', numero(c.vendidas) + ' de ' + numero(s.aforo)), barra);
    let estado;
    if (ritmo < 0.8) {
      estado = el('span', 'estado estado--falta', 'Venta lenta: ' + porcentaje(Math.round((1 - ritmo) * 100)) + ' por debajo');
      alertas.push({ c, ritmo });
    } else if (ritmo >= 1) estado = el('span', 'estado estado--ok', 'Por delante');
    else estado = el('span', 'estado estado--neutro', 'En línea');
    const td = el('td');
    td.appendChild(estado);
    fila.append(el('td', null, fechaLarga(c.fecha, false)), el('td', null, c.titulo + ' · ' + DIAS[c.dia].toLowerCase()), venta, el('td', 'num', numero(c.esperadas)), td);
    cuerpo.appendChild(fila);
  }
  t.append(el('caption', null, 'Entradas vendidas frente a las que suele llevar la sala a estas alturas.'), cab, cuerpo);
  document.getElementById('actualizado').textContent = 'Actualizado: ' + s.actualizado;

  const ul = document.getElementById('alertas-sala');
  for (const { c, ritmo } of alertas) {
    const li = el('li', 'alerta-item alerta-item--atencion');
    li.dataset.revelar = '';
    const ic = el('span', 'alerta-item__icono');
    ic.appendChild(icono('alerta'));
    const tx = el('div');
    tx.append(el('strong', null, 'Venta lenta: ' + c.titulo), el('p', null, fechaLarga(c.fecha, false) + '. Va un ' + Math.round((1 - ritmo) * 100) + ' % por debajo de lo normal. Activa la promoción para habituales esta semana.'));
    li.append(ic, tx);
    ul.appendChild(li);
  }
  const li = el('li', 'alerta-item alerta-item--plan');
  const ic = el('span', 'alerta-item__icono');
  ic.appendChild(icono('info'));
  const tx = el('div');
  const enlace = el('a', 'enlace', 'Probarlo en el simulador');
  enlace.href = 'simulador.html';
  const p = el('p', null, 'Los martes son el día más flojo. ');
  p.appendChild(enlace);
  tx.append(el('strong', null, 'Idea para la próxima temporada'), p);
  li.append(ic, tx);
  ul.appendChild(li);
}

function pintarFuentes(s) {
  const ul = document.getElementById('fuentes');
  for (const f of s.fuentes) {
    const li = el('li');
    li.append(el('span', null, f.nombre), el('small', null, f.frecuencia));
    ul.appendChild(li);
  }
}

datos('sala')
  .then((s) => {
    pintarKpis(s);
    pintarOcupacion(s);
    pintarProximos(s);
    pintarFuentes(s);
    listo();
  })
  .catch(mostrarError);
