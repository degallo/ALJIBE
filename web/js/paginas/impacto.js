// Proyectos a medida: informe de impacto con nivel de evidencia por indicador
import { iniciarMarco, listo, mostrarError, conclusion } from '../marco.js';
import { datos } from '../nucleo/api.js';
import { el } from '../nucleo/dom.js';
import { conUnidad, numero } from '../nucleo/formato.js';

iniciarMarco();

const NOMBRE_NIVEL = { medido: 'Medido', estimado: 'Estimado', declarado: 'Declarado' };
const valor = (i) => (i.tipo === 'litros' ? numero(i.valor) + ' l' : conUnidad(i.valor, i.tipo));

datos('impacto')
  .then((d) => {
    const indicador = (dim, n) => d.dimensiones.find((x) => x.id === dim).indicadores[n];
    conclusion(d.edicion + ': ' + numero(indicador('participacion', 0).valor) + ' personas y ' + indicador('patrimonio', 0).valor + ' familias cosecheras.');
    const niveles = document.getElementById('niveles');
    for (const [id, texto] of Object.entries(d.niveles)) {
      const li = el('li');
      li.append(el('span', 'nivel nivel--' + id, NOMBRE_NIVEL[id]), el('span', 'texto-suave', texto.split(': ')[1]));
      niveles.appendChild(li);
    }
    const cont = document.getElementById('dimensiones');
    for (const dim of d.dimensiones) {
      const sec = el('section', 'caja');
      sec.dataset.revelar = '';
      sec.setAttribute('aria-labelledby', 'dim-' + dim.id);
      const cab = el('div', 'dimension__cab');
      const h = el('h3', null, dim.nombre);
      h.id = 'dim-' + dim.id;
      h.style.fontSize = '20px';
      cab.append(h, el('span', 'dimension__ambito', dim.ambito));
      const t = el('table', 'tabla');
      const thead = el('thead');
      const tr = el('tr');
      for (const x of ['Indicador', 'Valor', 'Evolución', 'Cómo se obtiene', 'Fuente']) tr.appendChild(el('th', x === 'Valor' ? 'num' : null, x));
      thead.appendChild(tr);
      const tbody = el('tbody');
      for (const i of dim.indicadores) {
        const fila = el('tr');
        const nivel = el('td');
        nivel.appendChild(el('span', 'nivel nivel--' + i.nivel, NOMBRE_NIVEL[i.nivel]));
        fila.append(el('td', null, i.nombre), el('td', 'num', valor(i)), el('td', 'texto-suave', i.variacion || '—'), nivel, el('td', 'texto-suave', i.fuente));
        tbody.appendChild(fila);
      }
      t.append(thead, tbody);
      const scroll = el('div', 'tabla-scroll');
      scroll.appendChild(t);
      sec.append(cab, scroll);
      cont.appendChild(sec);
    }
    const ol = document.getElementById('conclusiones');
    d.conclusiones.forEach((c) => ol.appendChild(el('li', null, c)));
    listo();
  })
  .catch(mostrarError);
