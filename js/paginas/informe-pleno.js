// Informe para el pleno del Ayuntamiento de Alhama de Granada.
// Todas las cifras salen de los mismos datos que el resto de la web.
import { iniciarMarco, listo, mostrarError } from '../marco.js';
import { datos } from '../nucleo/api.js';
import { calcularCaso } from '../nucleo/calculos.js';
import { el, icono, svg, raiz } from '../nucleo/dom.js';
import { conUnidad, conSigno, diferencia, euros, numero } from '../nucleo/formato.js';

iniciarMarco();

function hoja(clase = '') {
  const h = el('section', 'hoja ' + clase);
  document.getElementById('documento').appendChild(h);
  return h;
}

function tabla(cabeceras, filas, numericas = [], pie) {
  const t = el('table', 'tabla');
  const thead = el('thead');
  const tr = el('tr');
  cabeceras.forEach((c, i) => tr.appendChild(el('th', numericas.includes(i) ? 'num' : null, c)));
  thead.appendChild(tr);
  const tbody = el('tbody');
  for (const f of filas) {
    const r = el('tr');
    f.forEach((c, i) => {
      const td = el('td', numericas.includes(i) ? 'num' : null);
      if (c instanceof Node) td.appendChild(c); else td.textContent = c;
      r.appendChild(td);
    });
    tbody.appendChild(r);
  }
  t.append(thead, tbody);
  if (pie) {
    const tf = el('tfoot');
    const r = el('tr');
    pie.forEach((c, i) => r.appendChild(el('td', numericas.includes(i) ? 'num' : null, c)));
    tf.appendChild(r);
    t.appendChild(tf);
  }
  const s = el('div', 'tabla-scroll');
  s.appendChild(t);
  return s;
}

function cifraDoc(etiqueta, valor, nivel) {
  const c = el('div', 'cifra-doc');
  c.append(el('small', null, etiqueta), el('strong', null, valor));
  if (nivel) c.appendChild(el('span', 'nivel nivel--' + nivel, nivel.charAt(0).toUpperCase() + nivel.slice(1)));
  return c;
}

function miniHistorico(fiesta) {
  const ed = fiesta.historico.ediciones;
  const W = 520, H = 140, B = 20;
  const max = 9000;
  const ancho = W / (ed.length + 1);
  const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'mini-historico', role: 'img', 'aria-label': 'Asistentes por edición de ' + ed[0].anio + ' a ' + ed[ed.length - 1].anio + ' y previsión para ' + fiesta.anio });
  const todas = ed.concat([{ anio: fiesta.anio, asistentes: fiesta.prevision.central, prevision: true }]);
  todas.forEach((e, i) => {
    const alto = (e.asistentes / max) * (H - B - 14);
    const x = i * ancho + 4;
    s.appendChild(svg('rect', { x, y: H - B - alto, width: ancho - 8, height: alto, rx: 3, fill: e.prevision ? '#2E8C9C' : e.anio === 2026 ? '#B4521A' : '#004C59' }));
    const t = svg('text', { x: x + (ancho - 8) / 2, y: H - 6, 'text-anchor': 'middle' });
    t.textContent = "'" + String(e.anio).slice(2);
    s.appendChild(t);
  });
  return s;
}

function pintar(inf, fiesta, dec, impacto, prod) {
  const caso = dec.casos.find((c) => c.id === 'fiesta');
  const plan = calcularCaso(caso, caso.decisiones.map((d) => d.id));
  const asis = plan.kpis.find((k) => k.id === 'asistentes');
  const total = plan.inversion + inf.paquete.precio;
  const retornoTotal = Math.round((plan.valor / total) * 10) / 10;
  const p = fiesta.prevision;

  // Barra de acciones (no se imprime)
  const barra = el('div', 'barra-doc no-imprimir');
  const volver = el('a', 'enlace', 'Volver a los entregables');
  volver.href = 'index.html';
  const imprimir = el('button', 'boton boton--primario');
  imprimir.type = 'button';
  imprimir.dataset.imprimir = '';
  imprimir.append(icono('imprimir'), 'Imprimir o guardar en PDF');
  const pdf = el('a', 'boton boton--claro');
  pdf.href = 'descargas/informe-pleno-fiesta-del-vino-2027.pdf';
  pdf.setAttribute('download', '');
  pdf.append(icono('descarga'), 'Descargar PDF');
  const acciones = el('div', 'fila');
  acciones.append(pdf, imprimir);
  barra.append(volver, acciones);
  document.getElementById('documento').appendChild(barra);

  // 1. Portada
  const h1 = hoja('portada-doc');
  const logo = el('img', 'portada-doc__logo');
  logo.src = raiz() + 'logos/aljibe-lockup.svg';
  logo.alt = 'ALJIBE';
  const tit = el('div', 'pila');
  tit.style.gap = '10px';
  tit.append(el('span', 'portada-doc__tipo', inf.documento), el('h1', null, inf.titulo), el('p', 'portada-doc__sub', inf.subtitulo));
  const arco = el('div', 'arco');
  arco.append(el('small', null, 'Asistencia prevista en ' + fiesta.anio), el('strong', null, numero(p.central)), el('span', null, 'Entre ' + numero(p.minimo) + ' y ' + numero(p.maximo)));
  const claves = el('div', 'cifras-doc');
  claves.append(
    cifraDoc('Fecha recomendada', 'Sáb. ' + fiesta.fechaRecomendada.dia + ' ' + fiesta.fechaRecomendada.mes),
    cifraDoc('Inversión del plan', euros(plan.inversion)),
    cifraDoc('Retorno por euro', numero(plan.retorno, 1) + '\u00a0€')
  );
  const ficha = el('div', 'ficha');
  for (const [k, v] of [['Para', inf.destinatario], ['Preparado por', inf.autor], ['Fecha', inf.fecha]]) {
    const d = el('div');
    d.append(el('small', null, k), el('span', null, v));
    ficha.appendChild(d);
  }
  h1.append(logo, tit, arco, claves, ficha);

  // 2. Resumen y balance de 2026
  const h2 = hoja();
  h2.append(el('h2', null, '1. Resumen'), el('p', 'resumen-doc', inf.resumen));
  h2.appendChild(tabla(
    ['Indicador', 'Si se repite 2026', 'Con el plan', 'Objetivo', 'Estado'],
    plan.kpis.map((k) => [k.nombre, conUnidad(k.hoy, k.tipo), conUnidad(k.previsto, k.tipo), conUnidad(k.objetivo, k.tipo),
      el('span', 'estado ' + (k.alcanzado ? 'estado--ok' : 'estado--falta'), k.alcanzado ? 'Alcanzado' : 'Faltan ' + diferencia(k.faltan, k.tipo))]),
    [1, 2, 3]
  ));
  h2.appendChild(el('h2', null, '2. Balance de la edición 2026'));
  const cifras = el('div', 'cifras-doc');
  for (const dim of impacto.dimensiones) {
    for (const i of dim.indicadores.slice(0, 1).concat(dim.id === 'economia' ? dim.indicadores.slice(1) : [])) {
      cifras.appendChild(cifraDoc(i.nombre, i.tipo === 'litros' ? numero(i.valor) + ' l' : conUnidad(i.valor, i.tipo), i.nivel));
    }
  }
  h2.appendChild(cifras);
  h2.appendChild(el('h3', null, 'Asistentes por edición'));
  h2.appendChild(miniHistorico(fiesta));
  h2.appendChild(el('p', 'nota-doc', fiesta.historico.nota + ' En naranja, 2026; en azul claro, la previsión de ' + fiesta.anio + '.'));
  const concl = el('ul', 'propuestas');
  impacto.conclusiones.forEach((c) => concl.appendChild(el('li', null, c)));
  h2.appendChild(concl);

  // 3. Previsión y plan de acción
  const h3 = hoja();
  h3.appendChild(el('h2', null, '3. Previsión para 2027'));
  const prev = el('div', 'cifras-doc');
  prev.append(
    cifraDoc('Asistencia prevista', numero(p.central)),
    cifraDoc('Rango', numero(p.minimo) + '–' + numero(p.maximo)),
    cifraDoc('Vasos a preparar', numero(fiesta.vasos.cantidad))
  );
  h3.appendChild(prev);
  h3.appendChild(tabla(
    ['Fecha', 'Puntos', 'Asistencia', 'Lluvia', 'Competencia', 'Por qué'],
    fiesta.fechas.map((f) => [f.dia + ' de ' + f.mes, f.puntos + '/100', numero(f.asis), f.lluvia, f.comp, f.resumen]),
    [1, 2, 3]
  ));
  h3.appendChild(el('p', 'nota-doc', fiesta.fechas[0].nota + ' ' + fiesta.campana.nota));
  h3.appendChild(el('h2', null, '4. Plan de acción'));
  const efecto = (d) => caso.kpis.filter((k) => d.efectos[k.id]).map((k) => conSigno(d.efectos[k.id], k.tipo) + ' ' + k.corto).join(' · ') || '—';
  h3.appendChild(tabla(
    ['Decisión', 'Coste', 'Efecto previsto', 'Valor generado'],
    caso.decisiones.map((d) => [d.titulo, d.coste ? euros(d.coste) : 'Sin coste', efecto(d), euros(d.valor)]),
    [1, 3],
    ['Total', euros(plan.inversion), numero(asis.previsto) + ' asistentes previstos', euros(plan.valor)]
  ));
  h3.appendChild(el('p', 'nota-doc', 'Con las cinco decisiones se alcanzan ' + plan.alcanzados + ' de ' + plan.kpis.length + ' objetivos. Retorno del plan: ' + numero(plan.retorno, 1) + ' € por cada euro invertido.'));

  // 4. Presupuesto, calendario, propuestas y fuentes
  const h4 = hoja();
  h4.appendChild(el('h2', null, '5. Presupuesto y retorno'));
  h4.appendChild(tabla(
    ['Concepto', 'Importe'],
    [['Plan de acción (5 decisiones)', euros(plan.inversion)], [inf.paquete.nombre + ' de ALJIBE (seguimiento e informe de impacto)', euros(inf.paquete.precio)]],
    [1],
    ['Total para el Ayuntamiento', euros(total)]
  ));
  const ret = el('div', 'cifras-doc');
  ret.append(
    cifraDoc('Valor generado previsto', euros(plan.valor)),
    cifraDoc('Retorno del plan', numero(plan.retorno, 1) + ' € por euro'),
    cifraDoc('Retorno con ALJIBE incluido', numero(retornoTotal, 1) + ' € por euro')
  );
  h4.appendChild(ret);
  h4.appendChild(el('h2', null, '6. Calendario'));
  const cal = el('ul', 'calendario-doc');
  for (const c of inf.calendario) {
    const li = el('li');
    li.append(el('span', 'mono', c.cuando), el('span', null, c.que), el('span', 'estado ' + (c.estado === 'hecho' ? 'estado--hecho' : c.estado === 'en curso' ? 'estado--neutro' : 'estado--neutro'), c.estado.charAt(0).toUpperCase() + c.estado.slice(1)));
    cal.appendChild(li);
  }
  h4.appendChild(cal);
  h4.appendChild(el('h2', null, '7. Propuestas de acuerdo para el pleno'));
  const ol = el('ol', 'propuestas');
  inf.propuestas.forEach((t) => ol.appendChild(el('li', null, t)));
  h4.appendChild(ol);
  h4.appendChild(el('p', 'nota-doc', 'Las cifras de 2027 son previsiones y se dan con su rango. Las de 2026 indican cómo se han obtenido: medido, estimado o declarado.'));

  // 5. Anexo: metodología y fuentes
  const h5 = hoja();
  h5.appendChild(el('h2', null, '8. Metodología y fuentes'));
  const fuentes = el('ul', 'propuestas fuentes-doc');
  fiesta.metodologia.concat(inf.fuentes).forEach((t) => fuentes.appendChild(el('li', null, t)));
  h5.appendChild(fuentes);
  h5.appendChild(el('h3', null, 'Cómo se lee cada cifra'));
  const niveles = el('ul', 'propuestas');
  Object.values(impacto.niveles).forEach((t) => niveles.appendChild(el('li', null, t)));
  h5.appendChild(niveles);
  const firma = el('div', 'firma');
  const logo2 = el('img');
  logo2.src = raiz() + 'logos/aljibe-lockup.svg';
  logo2.alt = 'ALJIBE';
  firma.append(el('span', 'nota-doc', 'Convertimos los datos de la cultura en decisiones. ' + inf.autor + ' · ' + inf.fecha + '.'), logo2);
  h5.appendChild(firma);
}

Promise.all([datos('informe-pleno'), datos('fiesta-2027'), datos('decisiones'), datos('impacto'), datos('productos')])
  .then(([inf, fiesta, dec, impacto, prod]) => {
    pintar(inf, fiesta, dec, impacto, prod);
    listo();
  })
  .catch(mostrarError);
