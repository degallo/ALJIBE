// Suscripción avanzada: segmentos, previsión de demanda y simulador de escenarios
import { iniciarMarco, listo, mostrarError } from '../marco.js';
import { datos } from '../nucleo/api.js';
import { simularConcierto } from '../nucleo/calculos.js';
import { el, icono } from '../nucleo/dom.js';
import { euros, numero, porcentaje, fechaLarga, conSigno } from '../nucleo/formato.js';

iniciarMarco();

let sala;
let base;
let estado;

function pintarSegmentos() {
  const cont = document.getElementById('segmentos');
  for (const s of sala.segmentos) {
    const c = el('div', 'segmento luz');
    c.dataset.revelar = '';
    c.append(el('strong', null, porcentaje(s.pct)), el('span', null, s.nombre), el('p', null, s.texto));
    cont.appendChild(c);
  }
}

function campoSelect(nombre, etiqueta, opciones, valor) {
  const l = el('label', 'campo');
  l.append(etiqueta);
  const s = el('select', 'entrada');
  s.name = nombre;
  for (const o of opciones) {
    const op = el('option', null, o.nombre);
    op.value = o.id;
    s.appendChild(op);
  }
  s.value = valor;
  l.appendChild(s);
  return l;
}

function campoRango(nombre, etiqueta, min, max, paso, valor, formato) {
  const l = el('label', 'campo');
  const cab = el('span', 'fila fila--entre');
  const v = el('span', 'mono', formato(valor));
  cab.append(el('span', null, etiqueta), v);
  const r = el('input', 'deslizador');
  r.type = 'range';
  r.name = nombre;
  Object.assign(r, { min, max, step: paso, value: valor });
  r.addEventListener('input', () => { v.textContent = formato(Number(r.value)); r.setAttribute('aria-valuetext', formato(Number(r.value))); });
  l.append(cab, r);
  return l;
}

function campoInterruptor(nombre, etiqueta, valor) {
  const d = el('div', 'campo-interruptor');
  const id = 'sw-' + nombre;
  const t = el('span', null, etiqueta);
  t.id = id;
  const b = el('button', 'interruptor interruptor--claro');
  b.type = 'button';
  b.name = nombre;
  b.setAttribute('role', 'switch');
  b.setAttribute('aria-checked', String(valor));
  b.setAttribute('aria-labelledby', id);
  b.addEventListener('click', () => { b.setAttribute('aria-checked', String(b.getAttribute('aria-checked') !== 'true')); b.dispatchEvent(new Event('input', { bubbles: true })); });
  d.append(t, b);
  return d;
}

function pintarFormulario() {
  const f = document.getElementById('form-sim');
  f.textContent = '';
  const conciertos = sala.proximos.map((c, i) => ({ id: String(i), nombre: c.titulo + ' · ' + fechaLarga(c.fecha, false) }));
  const elegido = campoSelect('concierto', 'Concierto de partida', conciertos, estado.indice);
  elegido.classList.add('campo--ancho');
  f.append(
    elegido,
    campoSelect('dia', 'Día de la semana', sala.dias, estado.dia),
    campoSelect('genero', 'Género', sala.generos, estado.genero),
    campoRango('precio', 'Precio de la entrada', 8, 20, 1, estado.precio, (v) => euros(v)),
    campoRango('cache', 'Caché del artista', 500, 4000, 100, estado.cache, (v) => euros(v)),
    campoInterruptor('promocion', 'Promoción para habituales', estado.promocion),
    campoInterruptor('bono', 'Bono de 5 conciertos', estado.bono)
  );
  f.addEventListener('input', leer);
  f.addEventListener('change', leer);
}

function desdeConcierto(i) {
  const c = sala.proximos[i];
  return { indice: String(i), dia: c.dia, genero: c.genero, precio: c.precio, cache: c.cache, promocion: false, bono: false };
}

function leer(e) {
  const f = document.getElementById('form-sim');
  if (e && e.target.name === 'concierto') {
    estado = desdeConcierto(Number(e.target.value));
    base = simularConcierto(sala.modelo, estado);
    pintarFormulario();
  } else {
    estado = {
      indice: f.elements.concierto.value,
      dia: f.elements.dia.value,
      genero: f.elements.genero.value,
      precio: Number(f.elements.precio.value),
      cache: Number(f.elements.cache.value),
      promocion: f.querySelector('[name="promocion"]').getAttribute('aria-checked') === 'true',
      bono: f.querySelector('[name="bono"]').getAttribute('aria-checked') === 'true'
    };
  }
  pintarSalida();
}

function pintarSalida() {
  const r = simularConcierto(sala.modelo, estado);
  const p = document.getElementById('salida-sim');
  p.textContent = '';
  const filas = el('div', 'oscuro__filas');
  for (const [k, v] of [['Público', numero(r.publico) + ' de ' + numero(sala.modelo.aforo)], ['Ingresos', euros(r.ingreso)], ['Costes', euros(r.coste)]]) {
    const f = el('div', 'oscuro__fila');
    f.append(el('span', null, k), el('span', 'mono', v));
    filas.appendChild(f);
  }
  const resultado = el('div', 'oscuro__fila');
  resultado.append(el('span', null, r.resultado >= 0 ? 'Ganancia' : 'Pérdida'), el('span', 'mono', euros(Math.abs(r.resultado))));
  filas.appendChild(resultado);
  const dif = r.ocupacion - base.ocupacion;
  const difRes = r.resultado - base.resultado;
  const nota = el('p', 'resultado-sim oscuro__suave');
  nota.textContent = dif === 0 && difRes === 0
    ? 'Es el plan actual del concierto. Cambia el día, el precio o la promoción para comparar.'
    : 'Frente al plan actual: ' + conSigno(dif, 'pct') + ' de ocupación y ' + conSigno(difRes, 'euros') + ' de resultado.';
  p.append(el('span', 'oscuro__etiqueta', 'Ocupación prevista'), el('span', 'oscuro__cifra', porcentaje(r.ocupacion)), filas, nota);
}

function pintarPrevision() {
  const t = document.getElementById('tabla-prevision');
  const cab = el('thead');
  const tr = el('tr');
  for (const h of ['Concierto', 'Previsión', 'Rango', 'Resultado previsto', 'Qué hacer']) tr.appendChild(el('th', ['Previsión', 'Rango', 'Resultado previsto'].includes(h) ? 'num' : null, h));
  cab.appendChild(tr);
  const cuerpo = el('tbody');
  sala.proximos.forEach((c, i) => {
    const r = simularConcierto(sala.modelo, desdeConcierto(i));
    const fila = el('tr');
    const accion = r.resultado < 0 ? 'Activar promoción o cambiar de día' : r.ocupacion < 55 ? 'Vigilar la venta' : 'Mantener';
    const celda = el('td');
    celda.appendChild(el('span', 'estado ' + (r.resultado < 0 ? 'estado--falta' : r.ocupacion < 55 ? 'estado--neutro' : 'estado--ok'), accion));
    fila.append(
      el('td', null, c.titulo + ' · ' + fechaLarga(c.fecha, false)),
      el('td', 'num', porcentaje(r.ocupacion)),
      el('td', 'num', Math.max(0, r.ocupacion - 6) + '–' + Math.min(100, r.ocupacion + 6) + ' %'),
      el('td', 'num', (r.resultado < 0 ? '−' : '+') + euros(Math.abs(r.resultado))),
      celda
    );
    cuerpo.appendChild(fila);
  });
  t.append(el('caption', null, 'Ocupación prevista con el modelo de la sala (día, género y precio).'), cab, cuerpo);
}

datos('sala')
  .then((s) => {
    sala = s;
    const flojo = s.proximos.findIndex((c) => c.dia === 'martes');
    const empezar = () => { estado = desdeConcierto(flojo); base = simularConcierto(sala.modelo, estado); pintarFormulario(); pintarSalida(); };
    pintarSegmentos();
    empezar();
    document.getElementById('restablecer').addEventListener('click', empezar);
    pintarPrevision();
    listo();
  })
  .catch(mostrarError);
