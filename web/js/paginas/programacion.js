// Estudio de programación: ranking de artistas con pesos ajustables y ranking de fechas
import { iniciarMarco, listo, mostrarError } from '../marco.js';
import { datos } from '../nucleo/api.js';
import { puntuarArtistas } from '../nucleo/calculos.js';
import { el, reducirMovimiento } from '../nucleo/dom.js';
import { euros, numero } from '../nucleo/formato.js';

iniciarMarco();

let prog, fiesta;
const pesos = {};

function pintarPesos() {
  const cont = document.getElementById('pesos');
  cont.textContent = '';
  for (const c of prog.criterios) {
    const id = 'peso-' + c.id;
    const fila = el('div', 'peso');
    const cab = el('label', 'peso__cab');
    cab.htmlFor = id;
    const valor = el('span', 'mono', pesos[c.id] + ' %');
    valor.id = id + '-valor';
    cab.append(el('span', null, c.nombre), valor);
    const r = el('input', 'deslizador');
    r.type = 'range';
    r.id = id;
    r.min = '0';
    r.max = '100';
    r.step = '5';
    r.value = String(pesos[c.id]);
    r.setAttribute('aria-describedby', id + '-ayuda');
    r.addEventListener('input', () => ajustar(c.id, Number(r.value)));
    const ayuda = el('span', 'peso__ayuda', c.ayuda);
    ayuda.id = id + '-ayuda';
    fila.append(cab, r, ayuda);
    cont.appendChild(fila);
  }
}

// Los tres pesos suman siempre 100: el resto se reparte en proporción
function ajustar(id, valor) {
  const otros = prog.criterios.map((c) => c.id).filter((x) => x !== id);
  const resto = 100 - valor;
  const sumaOtros = otros.reduce((t, x) => t + pesos[x], 0);
  pesos[id] = valor;
  otros.forEach((x, i) => {
    pesos[x] = i === otros.length - 1
      ? 100 - valor - otros.slice(0, -1).reduce((t, y) => t + pesos[y], 0)
      : Math.round(sumaOtros ? (pesos[x] / sumaOtros) * resto : resto / otros.length);
  });
  for (const c of prog.criterios) {
    document.getElementById('peso-' + c.id).value = String(pesos[c.id]);
    document.getElementById('peso-' + c.id + '-valor').textContent = pesos[c.id] + ' %';
  }
  pintarRanking();
}

function pintarRanking() {
  const lista = document.getElementById('lista-artistas');
  const antes = new Map([...lista.children].map((li) => [li.dataset.id, li.getBoundingClientRect().top]));
  const r = puntuarArtistas(prog.artistas, pesos);
  lista.textContent = '';
  r.forEach((a, i) => {
    const li = el('li', 'artista' + (i === 0 ? ' artista--primero' : ''));
    li.dataset.id = a.id;
    const info = el('div');
    const barra = el('div', 'artista__barra');
    barra.setAttribute('aria-hidden', 'true');
    const relleno = el('span');
    relleno.style.width = a.puntos + '%';
    barra.appendChild(relleno);
    info.append(el('div', 'artista__nombre', a.nombre + ' · ' + a.estilo), el('div', 'artista__det', a.origen + ' · caché ' + euros(a.cache) + ' · ' + numero((a.puntos / a.cache) * 1000, 1) + ' puntos por cada 1.000 €'), barra);
    const pts = el('div', 'artista__puntos');
    pts.append(el('strong', null, String(a.puntos)), el('span', null, 'de 100'));
    li.append(el('span', 'artista__puesto', String(i + 1)), info, pts);
    li.setAttribute('aria-label', 'Puesto ' + (i + 1) + ': ' + a.nombre + ', ' + a.estilo + ', ' + a.puntos + ' puntos');
    lista.appendChild(li);
  });
  // Animación FLIP al cambiar de puesto
  if (antes.size && !reducirMovimiento()) {
    [...lista.children].forEach((li) => {
      const y0 = antes.get(li.dataset.id);
      if (y0 == null) return;
      const dy = y0 - li.getBoundingClientRect().top;
      if (dy) li.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.28,.11,.32,1)' });
    });
  }
  pintarRecomendacion(r);
}

function pintarRecomendacion(r) {
  const top = r[0];
  const eficiente = r.slice().sort((a, b) => b.puntos / b.cache - a.puntos / a.cache)[0];
  const fecha = fiesta.fechas[0];
  const p = document.getElementById('recomendacion');
  p.textContent = '';
  const filas = el('div', 'oscuro__filas');
  for (const [k, v] of [['Puntuación', top.puntos + '/100'], ['Caché', euros(top.cache)], ['Fecha', fecha.dia + ' de ' + fecha.mes], ['Más puntos por euro', eficiente.nombre]]) {
    const f = el('div', 'oscuro__fila');
    f.append(el('span', null, k), el('span', 'mono', v));
    filas.appendChild(f);
  }
  const nota = el('p', 'oscuro__suave', prog.recomendacion);
  nota.style.cssText = 'font-size:14px;line-height:21px';
  p.append(el('span', 'oscuro__etiqueta', 'Recomendación con estos pesos'), el('h2', 'oscuro__grande', top.nombre + ': ' + top.estilo.toLowerCase()), filas, nota);
}

function pintarFechas() {
  const t = document.getElementById('tabla-fechas');
  const cab = el('thead');
  const tr = el('tr');
  for (const h of ['Puesto', 'Fecha', 'Puntos', 'Asistencia', 'Lluvia', 'Competencia', 'Festivos']) tr.appendChild(el('th', ['Puesto', 'Puntos', 'Asistencia', 'Lluvia'].includes(h) ? 'num' : null, h));
  cab.appendChild(tr);
  const cuerpo = el('tbody');
  fiesta.fechas.forEach((f, i) => {
    const fila = el('tr');
    fila.append(el('td', 'num', String(i + 1)), el('td', null, f.dia + ' de ' + f.mes), el('td', 'num', f.puntos + '/100'), el('td', 'num', numero(f.asis)), el('td', 'num', f.lluvia), el('td', null, f.comp), el('td', null, f.fest));
    cuerpo.appendChild(fila);
  });
  const cap = el('caption', null, 'Las cuatro fechas posibles, ordenadas por puntuación.');
  t.append(cap, cab, cuerpo);
}

Promise.all([datos('programacion'), datos('fiesta-2027')])
  .then(([p, f]) => {
    prog = p;
    fiesta = f;
    const restablecer = () => { prog.criterios.forEach((c) => { pesos[c.id] = c.peso; }); pintarPesos(); pintarRanking(); };
    restablecer();
    document.getElementById('restablecer').addEventListener('click', restablecer);
    document.getElementById('nota-artistas').textContent = prog.nota;
    pintarFechas();
    listo();
  })
  .catch(mostrarError);
