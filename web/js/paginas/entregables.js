// Índice de entregables para el Ayuntamiento de Alhama de Granada
import { iniciarMarco, listo, mostrarError } from '../marco.js';
import { datos } from '../nucleo/api.js';
import { calcularCaso } from '../nucleo/calculos.js';
import { el, icono, raiz } from '../nucleo/dom.js';
import { numero, euros } from '../nucleo/formato.js';

iniciarMarco();

function pintarDestacado(item, fiesta, plan) {
  const a = el('a', 'destacado');
  a.href = raiz() + item.href;
  const tx = el('div', 'destacado__texto');
  const cta = el('span', 'boton-claro');
  cta.append(icono('documento'), 'Abrir el informe');
  tx.append(el('span', 'etiqueta', item.servicio), el('h2', 'destacado__titulo', item.titulo), el('p', 'destacado__desc', item.texto), cta);
  const cifras = el('div', 'destacado__cifras');
  const datosClave = [
    ['Asistencia prevista', numero(fiesta.prevision.central)],
    ['Fecha recomendada', fiesta.fechaRecomendada.dia + ' ' + fiesta.fechaRecomendada.mes],
    ['Inversión del plan', euros(plan.inversion)],
    ['Retorno por euro', numero(plan.retorno, 1) + ' €']
  ];
  for (const [k, v] of datosClave) {
    const c = el('span', 'destacado__cifra');
    c.append(el('small', null, k), el('strong', null, v));
    cifras.appendChild(c);
  }
  a.append(tx, cifras);
  document.getElementById('destacado').appendChild(a);
}

function pintarLista(lista) {
  const cont = document.getElementById('lista');
  for (const it of lista) {
    const a = el('a', 'entregable luz');
    a.href = raiz() + it.href;
    a.dataset.cliente = it.cliente;
    a.dataset.revelar = '';
    const cab = el('span', 'entregable__cab');
    const ic = el('span', 'icono-redondo');
    ic.appendChild(icono(it.icono));
    const fl = el('span', 'flecha');
    fl.appendChild(icono('flecha'));
    cab.append(ic, fl);
    const pie = el('span', 'entregable__pie');
    pie.append(el('span', 'entregable__servicio', it.servicio), el('span', 'estado ' + (it.cliente === 'alhama' ? 'estado--ok' : 'estado--neutro'), it.estado));
    a.append(cab, el('span', 'entregable__titulo', it.titulo), el('span', 'entregable__texto', it.texto), pie);
    cont.appendChild(a);
  }
}

function filtrar(id, botones) {
  botones.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
  let visibles = 0;
  document.querySelectorAll('#lista .entregable').forEach((a) => {
    const ver = id === 'todos' || a.dataset.cliente === id;
    a.hidden = !ver;
    if (ver) visibles++;
  });
  document.getElementById('n-entregables').textContent = visibles;
  document.getElementById('destacado').hidden = id === 'otros';
  document.getElementById('calendario').hidden = id === 'otros';
}

Promise.all([datos('entregables'), datos('productos'), datos('fiesta-2027'), datos('decisiones')])
  .then(([d, prod, fiesta, dec]) => {
    const h1 = document.getElementById('titulo');
    h1.append(d.titulo[0], document.createElement('br'), el('span', null, d.titulo[1]));
    document.getElementById('subtitulo').textContent = d.subtitulo;

    const caso = dec.casos.find((c) => c.id === 'fiesta');
    const plan = calcularCaso(caso, caso.decisiones.map((x) => x.id));
    pintarDestacado(d.lista.find((x) => x.destacado), fiesta, plan);

    document.getElementById('paquete-precio').textContent = prod.paquete.precio;
    const ol = document.getElementById('pasos');
    for (const s of prod.paquete.pasos) {
      const li = el('li');
      const a = el('a', 'paso' + (s.destacado ? ' paso--destacado' : ''));
      a.href = raiz() + s.enlace;
      const ver = el('span', 'paso__ver', 'Abrir');
      ver.appendChild(icono('flecha', 'ico ico--s'));
      a.append(el('span', 'paso__cuando', s.cuando), el('span', 'paso__que', s.que), ver);
      li.appendChild(a);
      ol.appendChild(li);
    }

    pintarLista(d.lista.filter((x) => !x.destacado));
    const cont = document.getElementById('filtros');
    const botones = d.filtros.map((f) => {
      const b = el('button', 'pildora filtro', f.nombre);
      b.type = 'button';
      b.dataset.id = f.id;
      b.addEventListener('click', () => filtrar(f.id, botones));
      cont.appendChild(b);
      return b;
    });
    filtrar('alhama', botones);
    listo();
  })
  .catch(mostrarError);
