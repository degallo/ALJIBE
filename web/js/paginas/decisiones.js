// Panel de decisiones (docs/diseno-panel-decisiones.md)
import { iniciarMarco, listo, mostrarError } from '../marco.js';
import { datos } from '../nucleo/api.js';
import { calcularCaso } from '../nucleo/calculos.js';
import { el } from '../nucleo/dom.js';
import { conUnidad, diferencia, conSigno, euros, numero } from '../nucleo/formato.js';

iniciarMarco();

let casos = [];
let actual;
const activas = new Map(); // se conserva lo activado en cada caso
let anterior = null;

function pintarCasos() {
  const cont = document.getElementById('casos');
  cont.textContent = '';
  for (const c of casos) {
    const b = el('button', 'pildora caso', c.nombre);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(c.id === actual.id));
    b.addEventListener('click', () => cambiarCaso(c.id));
    cont.appendChild(b);
  }
}

function cambiarCaso(id) {
  actual = casos.find((c) => c.id === id) || casos[0];
  anterior = null;
  const url = new URL(location.href);
  url.searchParams.set('caso', actual.id);
  history.replaceState(null, '', url);
  pintarCasos();
  document.getElementById('contexto').textContent = actual.contexto + '. ' + actual.partida;
  pintarDecisiones();
  recalcular(false);
}

function efectoTexto(d) {
  const partes = actual.kpis
    .filter((k) => d.efectos[k.id])
    .map((k) => conSigno(d.efectos[k.id], k.tipo, k.decimales) + ' ' + k.corto);
  return partes.length ? partes.join(' · ') : 'Sin efecto directo en los indicadores';
}

function pintarDecisiones() {
  const ul = document.getElementById('lista-decisiones');
  ul.textContent = '';
  const on = activas.get(actual.id);
  for (const d of actual.decisiones) {
    const li = el('li', 'decision');
    const sw = el('button', 'interruptor');
    sw.type = 'button';
    sw.setAttribute('role', 'switch');
    sw.setAttribute('aria-checked', String(on.has(d.id)));
    sw.setAttribute('aria-label', d.titulo);
    sw.addEventListener('click', () => {
      if (on.has(d.id)) on.delete(d.id); else on.add(d.id);
      sw.setAttribute('aria-checked', String(on.has(d.id)));
      li.classList.toggle('decision--off', !on.has(d.id));
      recalcular(true);
    });
    const tx = el('div', 'decision__texto');
    tx.append(
      el('span', 'decision__titulo', d.titulo),
      el('span', 'decision__coste', d.coste ? 'Coste: ' + euros(d.coste) : 'Sin coste'),
      el('span', 'decision__efecto', efectoTexto(d))
    );
    li.classList.toggle('decision--off', !on.has(d.id));
    li.append(sw, tx);
    ul.appendChild(li);
  }
}

function textoRetorno(r) {
  return r.retorno === null ? 'sin coste' : numero(r.retorno, 1) + ' € por cada euro invertido';
}

function recalcular(anunciar) {
  const r = calcularCaso(actual, activas.get(actual.id));

  // KPIs
  const cont = document.getElementById('kpis');
  cont.textContent = '';
  r.kpis.forEach((k, i) => {
    const art = el('article', 'kpi luz');
    const previsto = el('span', 'kpi__previsto', conUnidad(k.previsto, k.tipo, k.decimales));
    if (anterior && anterior.kpis[i].previsto !== k.previsto) previsto.classList.add('cambia');
    const objetivo = el('div', 'kpi__objetivo');
    objetivo.append(el('span', null, 'Objetivo'), el('strong', null, conUnidad(k.objetivo, k.tipo, k.decimales)));
    const barra = el('div', 'progreso-barra');
    barra.setAttribute('role', 'progressbar');
    barra.setAttribute('aria-label', 'Progreso hacia el objetivo de ' + k.nombre.toLowerCase());
    barra.setAttribute('aria-valuemin', '0');
    barra.setAttribute('aria-valuemax', '100');
    barra.setAttribute('aria-valuenow', String(Math.round(k.progreso * 100)));
    const relleno = el('span');
    relleno.style.setProperty('--v', (anterior ? anterior.kpis[i].progreso * 100 : 0) + '%');
    barra.appendChild(relleno);
    requestAnimationFrame(() => requestAnimationFrame(() => relleno.style.setProperty('--v', k.progreso * 100 + '%')));
    const estado = k.alcanzado
      ? el('span', 'estado estado--ok', 'Objetivo alcanzado')
      : el('span', 'estado estado--falta', 'Faltan ' + diferencia(k.faltan, k.tipo, k.decimales));
    art.append(
      el('h3', 'kpi__nombre', k.nombre),
      el('span', 'kpi__hoy', 'Hoy: ' + conUnidad(k.hoy, k.tipo, k.decimales)),
      el('span', 'kpi__etq', 'Con las decisiones'),
      previsto, objetivo, barra, estado
    );
    cont.appendChild(art);
  });

  // Totales del panel oscuro
  const tot = document.getElementById('totales');
  tot.textContent = '';
  for (const [k, v] of [['Inversión total', euros(r.inversion)], ['Valor generado', euros(r.valor)], ['Retorno', textoRetorno(r)]]) {
    const f = el('div', 'oscuro__fila' + (k === 'Retorno' ? ' oscuro__fila--apilada' : ''));
    f.append(el('span', null, k), el('span', k === 'Retorno' ? null : 'mono', v));
    tot.appendChild(f);
  }

  // Resultado del plan: la cifra protagonista de la pantalla
  const principal = r.kpis.find((k) => k.id === actual.kpiPrincipal);
  const cifra = document.getElementById('res-cifra');
  cifra.textContent = conUnidad(principal.previsto, principal.tipo, principal.decimales);
  if (anterior && anterior.kpis.find((k) => k.id === principal.id).previsto !== principal.previsto) {
    cifra.classList.remove('cambia');
    void cifra.offsetWidth;
    cifra.classList.add('cambia');
  }
  document.getElementById('res-texto').textContent = principal.nombre.toLowerCase() + ' con el plan · objetivo ' +
    conUnidad(principal.objetivo, principal.tipo, principal.decimales) + ' · hoy ' + conUnidad(principal.hoy, principal.tipo, principal.decimales);
  const apoyo = document.getElementById('res-apoyo');
  apoyo.textContent = '';
  for (const [k, v] of [
    ['Inversión', euros(r.inversion)],
    ['Retorno por euro', r.retorno === null ? 'sin coste' : numero(r.retorno, 1) + '\u00a0€'],
    ['Objetivos alcanzados', r.alcanzados + ' de ' + r.kpis.length]
  ]) {
    const d = el('div', 'resultado-hero__dato');
    d.append(el('dt', null, k), el('dd', 'mono', v));
    apoyo.appendChild(d);
  }

  if (anunciar) {
    document.getElementById('anuncio').textContent =
      principal.nombre + ': ' + conUnidad(principal.previsto, principal.tipo, principal.decimales) +
      '. Objetivos alcanzados: ' + r.alcanzados + ' de ' + r.kpis.length +
      '. Inversión: ' + euros(r.inversion) + '. Retorno: ' + textoRetorno(r) + '.';
  }
  anterior = r;
}

datos('decisiones')
  .then((d) => {
    casos = d.casos;
    const h1 = document.getElementById('titulo');
    h1.append(d.titulo, document.createElement('br'), el('span', null, d.subtitulo));
    for (const c of casos) activas.set(c.id, new Set(c.decisiones.map((x) => x.id)));
    const pedido = new URLSearchParams(location.search).get('caso');
    actual = casos.find((c) => c.id === pedido) || casos[0];
    cambiarCaso(actual.id);
    document.getElementById('imprimir-plan').addEventListener('click', () => window.print());
    listo();
  })
  .catch(mostrarError);
