// Dossier para patrocinadores con calculadora de paquetes
import { iniciarMarco, listo, mostrarError, conclusion } from '../marco.js';
import { datos } from '../nucleo/api.js';
import { el, icono } from '../nucleo/dom.js';
import { numero, euros, porcentaje } from '../nucleo/formato.js';

iniciarMarco();

let d;
const elegidos = new Set(['principal', 'vasos']);

function dato(etiqueta, valor, unidad, nota, oscuro) {
  const c = el('div', 'dato luz' + (oscuro ? ' dato--oscuro' : ''));
  c.dataset.revelar = '';
  const v = el('span', 'dato__valor');
  const n = el('span', null, valor);
  if (/^\d{1,3}(\.\d{3})+$/.test(valor)) n.dataset.contar = '';
  v.appendChild(n);
  if (unidad) v.appendChild(el('small', null, ' ' + unidad));
  c.append(el('span', 'dato__etiqueta', etiqueta), v);
  if (nota) c.appendChild(el('span', 'dato__nota', nota));
  return c;
}

function barras(id, filas, clave, etiqueta) {
  const cont = document.getElementById(id);
  const max = Math.max(...filas.map((f) => f.pct));
  for (const f of filas) {
    const fila = el('div', 'barras-h__fila');
    const pista = el('span', 'barras-h__pista');
    pista.setAttribute('aria-hidden', 'true');
    const b = el('span');
    b.style.setProperty('--v', (f.pct / max) * 100 + '%');
    pista.appendChild(b);
    fila.append(el('span', null, f[clave]), pista, el('span', 'num', porcentaje(f.pct)));
    fila.setAttribute('aria-label', f[clave] + ': ' + porcentaje(f.pct) + ' ' + etiqueta);
    cont.appendChild(fila);
  }
}

function pintarPaquetes() {
  const cont = document.getElementById('lista-paquetes');
  for (const p of d.paquetes) {
    const b = el('button', 'opcion paquete tono-blanco luz');
    b.type = 'button';
    b.setAttribute('aria-pressed', String(elegidos.has(p.id)));
    const cab = el('span', 'opcion__cab');
    const marca = el('span', 'paquete__marca');
    marca.appendChild(icono('check'));
    cab.append(el('span', 'opcion__nombre', p.nombre), marca);
    const ul = el('ul');
    p.incluye.forEach((t) => { const li = el('li'); li.append(icono('check'), t); ul.appendChild(li); });
    const pie = el('span', 'fila fila--entre');
    pie.append(el('span', 'paquete__precio', euros(p.precio)), el('span', 'texto-pie', numero(p.impactos) + ' impactos'));
    b.append(cab, ul, pie);
    b.addEventListener('click', () => {
      if (elegidos.has(p.id)) elegidos.delete(p.id); else elegidos.add(p.id);
      b.setAttribute('aria-pressed', String(elegidos.has(p.id)));
      calcular();
    });
    cont.appendChild(b);
  }
}

function calcular() {
  const sel = d.paquetes.filter((p) => elegidos.has(p.id));
  const total = sel.reduce((t, p) => t + p.precio, 0);
  const honorarios = total ? d.honorarios.fijo + Math.round((total * d.honorarios.porcentaje) / 100) : 0;
  const impactos = sel.reduce((t, p) => t + p.impactos, 0);
  const panel = document.getElementById('calculo');
  panel.textContent = '';
  const filas = el('div', 'oscuro__filas');
  for (const [k, v] of [
    ['Paquetes elegidos', String(sel.length)],
    ['Honorarios de ALJIBE', euros(honorarios)],
    ['Neto para la fiesta', euros(total - honorarios)],
    ['Coste por 1.000 impactos', impactos ? euros(Math.round((total / impactos) * 1000)) : '—']
  ]) {
    const f = el('div', 'oscuro__fila');
    f.append(el('span', null, k), el('span', 'mono', v));
    filas.appendChild(f);
  }
  const nota = el('p', 'oscuro__suave', 'ALJIBE cobra ' + euros(d.honorarios.fijo) + ' + ' + d.honorarios.porcentaje + ' % del patrocinio nuevo. Si no hay patrocinio nuevo, no hay honorarios.');
  nota.style.cssText = 'font-size:14px;line-height:21px';
  const enviar = el('a', 'boton-claro');
  enviar.href = 'mailto:?subject=' + encodeURIComponent('Fiesta del Vino 2027: dossier de patrocinio') + '&body=' + encodeURIComponent('Te enviamos el dossier de patrocinio de la Fiesta del Vino 2027: ' + location.href);
  enviar.append(icono('enviar'), 'Enviar a una marca');
  panel.append(el('span', 'oscuro__etiqueta', 'Patrocinio total'), el('span', 'oscuro__cifra', euros(total)), filas, nota, enviar);
}

datos('patrocinio')
  .then((x) => {
    d = x;
    const p = d.publico;
    conclusion(numero(p.previsto) + ' personas, el ' + p.fuera + ' % de fuera de la comarca.');
    document.getElementById('cifras-publico').append(
      dato('Asistentes previstos', numero(p.previsto), '', 'Fiesta del Vino 2027', true),
      dato('De fuera de la comarca', String(p.fuera), '%', 'Encuesta de código postal'),
      dato('Gasto medio en el pueblo', String(p.gastoMedio), '€', 'Por persona y día'),
      dato('Alcance en redes', numero(p.alcanceRedes), '', 'Semana de la fiesta · ' + p.noticias + ' noticias en prensa')
    );
    barras('edades', d.edades, 'tramo', 'del público');
    barras('procedencia', d.procedencia, 'zona', 'del público');
    pintarPaquetes();
    calcular();
    document.getElementById('fuentes').textContent = 'Fuentes: ' + d.fuentes;
    listo();
  })
  .catch(mostrarError);
