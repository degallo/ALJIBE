// Memoria de resultados de una fiesta: asistencia contada en los accesos,
// gasto en el pueblo y comparación con la edición anterior. Las cifras salen
// del informe de impacto (impacto.json) y del histórico de la fiesta.
import { iniciarMarco, listo, mostrarError, conclusion } from '../marco.js';
import { datos } from '../nucleo/api.js';
import { el, icono, raiz } from '../nucleo/dom.js';
import { numero, euros, porcentaje } from '../nucleo/formato.js';

iniciarMarco();

const NOMBRE_NIVEL = { medido: 'Medido', estimado: 'Estimado', declarado: 'Declarado' };

function nivel(i) {
  return el('span', 'nivel nivel--' + i.nivel, NOMBRE_NIVEL[i.nivel]);
}

function bloque(titulo, cifra, detalle, indicador, clase = '') {
  const b = el('article', 'caja memoria__bloque ' + clase);
  b.dataset.revelar = '';
  const cab = el('div', 'memoria__cab');
  cab.append(el('h2', 'memoria__titulo', titulo), nivel(indicador));
  const c = el('p', 'memoria__cifra num', cifra);
  b.append(cab, c, el('p', 'memoria__detalle', detalle), el('p', 'memoria__fuente', 'Fuente: ' + indicador.fuente));
  return b;
}

Promise.all([datos('memoria'), datos('impacto'), datos('fiesta-2027')])
  .then(([m, imp, fiesta]) => {
    const todos = imp.dimensiones.flatMap((d) => d.indicadores);
    const ind = (nombre) => todos.find((i) => i.nombre === nombre);
    const asis = ind(m.bloques.asistencia.dato);
    const gasto = ind(m.bloques.gasto.dato);
    const ed = fiesta.historico.ediciones;
    const actual = ed.find((e) => e.anio === imp.edicion);
    const anterior = ed[ed.indexOf(actual) - 1];
    const variacion = ((actual.asistentes - anterior.asistentes) / anterior.asistentes) * 100;

    document.getElementById('servicio').textContent = m.servicio;
    document.getElementById('titulo').textContent = fiesta.evento + ' ' + imp.edicion;
    document.getElementById('para').textContent = m.para;
    conclusion(numero(asis.valor) + ' personas, contadas en los accesos.');

    const res = document.getElementById('resultados');
    res.append(
      bloque(m.bloques.asistencia.titulo, numero(asis.valor), m.bloques.asistencia.detalle, asis, 'memoria__bloque--principal'),
      bloque(m.bloques.gasto.titulo, euros(gasto.valor), m.bloques.gasto.detalle, gasto)
    );

    // Comparación: barras de las dos ediciones y la diferencia con signo
    const comp = el('article', 'caja memoria__bloque');
    comp.dataset.revelar = '';
    const cab = el('div', 'memoria__cab');
    cab.append(el('h2', 'memoria__titulo', m.bloques.comparacion.titulo), nivel(asis));
    const dif = el('p', 'memoria__cifra num' + (variacion < 0 ? ' memoria__cifra--baja' : ''), (variacion < 0 ? '−' : '+') + porcentaje(Math.abs(Math.round(variacion))));
    const barras = el('div', 'barras-h');
    const max = Math.max(actual.asistentes, anterior.asistentes);
    for (const e of [anterior, actual]) {
      const fila = el('div', 'barras-h__fila');
      const pista = el('span', 'barras-h__pista');
      pista.setAttribute('aria-hidden', 'true');
      const b = el('span');
      b.style.setProperty('--v', (e.asistentes / max) * 100 + '%');
      if (e !== actual) b.style.background = 'var(--agua)';
      pista.appendChild(b);
      fila.append(el('span', null, String(e.anio)), pista, el('span', 'num', numero(e.asistentes)));
      fila.setAttribute('aria-label', e.anio + ': ' + numero(e.asistentes) + ' asistentes');
      barras.appendChild(fila);
    }
    comp.append(cab, dif, el('p', 'memoria__detalle', 'asistentes frente a ' + anterior.anio), barras, el('p', 'memoria__fuente', fiesta.historico.nota));
    res.appendChild(comp);

    const lm = document.getElementById('lista-metodo');
    m.metodo.forEach((x) => {
      const li = el('li');
      li.append(el('strong', null, x.titulo), el('span', 'texto-suave', x.texto));
      lm.appendChild(li);
    });

    const s = document.getElementById('siguiente');
    const h = el('h2', null, m.siguiente.titulo);
    h.id = 't-siguiente';
    const a = el('a', 'boton-claro', m.siguiente.enlace);
    a.href = raiz() + m.siguiente.href;
    a.appendChild(icono('flecha', 'ico ico--s'));
    s.append(h, el('p', null, m.siguiente.texto), a);
    listo();
  })
  .catch(mostrarError);
