// El día de la fiesta: simulación del conteo en directo
import { iniciarMarco, listo, mostrarError } from '../marco.js';
import { datos } from '../nucleo/api.js';
import { conteoA } from '../nucleo/calculos.js';
import { el, icono, svg, reducirMovimiento } from '../nucleo/dom.js';
import { numero, porcentaje } from '../nucleo/formato.js';

iniciarMarco();

let dia;
let hora;
let reproduciendo = false;
let ultimo = null;
const refs = {};

const textoHora = (h) => {
  const min = Math.round(h * 60);
  return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
};

function crearContadores() {
  const cont = document.getElementById('contadores');
  const crear = (clave, etiqueta, oscuro) => {
    const d = el('div', 'dato' + (oscuro ? ' dato--oscuro' : ''));
    const v = el('span', 'dato__valor');
    const nota = el('span', 'dato__nota');
    d.append(el('span', 'dato__etiqueta', etiqueta), v, nota);
    cont.appendChild(d);
    refs[clave] = { caja: d, valor: v, nota };
  };
  crear('hora', 'Hora', true);
  crear('entrada', 'Han entrado');
  crear('dentro', 'Dentro ahora');
  crear('vasos', 'Vasos que quedan');
  const barra = el('div', 'progreso-barra');
  barra.setAttribute('aria-hidden', 'true');
  barra.appendChild(el('span'));
  refs.dentro.caja.appendChild(barra);
  refs.dentro.barra = barra.firstChild;
}

function crearGrafico() {
  const W = 520, H = 220, ABA = 28;
  const max = Math.max(...dia.llegadas.map((t) => t.cuota));
  const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'grafico', role: 'img', 'aria-label': 'Entradas previstas por hora, de ' + dia.apertura + ':00 a ' + dia.cierre + ':00' });
  const ancho = W / dia.llegadas.length;
  refs.barras = dia.llegadas.map((t, i) => {
    const alto = (t.cuota / max) * (H - ABA - 24);
    const g = svg('g');
    const fondo = svg('rect', { x: i * ancho + 6, y: H - ABA - alto, width: ancho - 12, height: alto, rx: 4, fill: '#CFE6EA' });
    const lleno = svg('rect', { x: i * ancho + 6, y: H - ABA, width: ancho - 12, height: 0, rx: 4, fill: '#004C59', class: 'barra-dia' });
    const n = svg('text', { x: i * ancho + ancho / 2, y: H - ABA - alto - 6, 'text-anchor': 'middle' });
    n.textContent = numero(Math.round(dia.total * t.cuota / 10) * 10);
    const tx = svg('text', { x: i * ancho + ancho / 2, y: H - 8, 'text-anchor': 'middle' });
    tx.textContent = t.hora + 'h';
    g.append(fondo, lleno, n, tx);
    s.appendChild(g);
    return { lleno, alto, base: H - ABA, cuota: t.cuota, hora: t.hora };
  });
  document.getElementById('grafico-horas').appendChild(s);
}

function crearProcedencia() {
  const cont = document.getElementById('procedencia');
  refs.proc = dia.procedencia.map((p) => {
    const fila = el('div', 'barras-h__fila');
    const pista = el('span', 'barras-h__pista');
    pista.setAttribute('aria-hidden', 'true');
    const b = el('span');
    pista.appendChild(b);
    const n = el('span', 'num');
    fila.append(el('span', null, p.zona), pista, n);
    cont.appendChild(fila);
    return { b, n, pct: p.pct };
  });
}

// Avisos que salen al cruzar umbrales (se calculan una vez para todo el día)
function calcularAvisos() {
  const avisos = [{ hora: dia.apertura, tipo: 'plan', titulo: 'Se abren los accesos', texto: 'Contadores en marcha en las dos entradas.' }];
  let mitad = false, aforo = false, vasos = false, pico = { dentro: 0, hora: 0 };
  for (let h = dia.apertura; h <= dia.cierre; h += 0.05) {
    const c = conteoA(h, dia);
    if (c.dentro > pico.dentro) pico = { dentro: c.dentro, hora: h };
    if (!mitad && c.llegadas >= dia.total / 2) { mitad = true; avisos.push({ hora: h, tipo: 'bien', titulo: 'Ya ha entrado la mitad del público', texto: numero(c.llegadas) + ' personas a las ' + textoHora(h) + '.' }); }
    if (!aforo && c.dentro >= dia.aforo * 0.8) { aforo = true; avisos.push({ hora: h, tipo: 'atencion', titulo: 'Atención: aforo al 80 %', texto: 'Abrir la zona de la plaza y reforzar la segunda barra.' }); }
    if (!vasos && c.vasosQuedan <= dia.vasos * 0.15) { vasos = true; avisos.push({ hora: h, tipo: 'atencion', titulo: 'Atención: quedan menos del 15 % de los vasos', texto: numero(c.vasosQuedan) + ' vasos. Avisar a las barras y priorizar la venta de recarga.' }); }
  }
  avisos.push({ hora: pico.hora + 0.5, tipo: 'plan', titulo: 'Pico de la tarde superado', texto: 'Máximo de ' + numero(pico.dentro) + ' personas dentro a las ' + textoHora(pico.hora) + '.' });
  avisos.push({ hora: dia.cierre, tipo: 'bien', titulo: 'Cierre: ' + numero(dia.total) + ' asistentes', texto: 'Los datos pasan al informe de impacto para el pleno.' });
  return avisos.sort((a, b) => a.hora - b.hora);
}

const ICONO = { bien: 'sube', atencion: 'alerta', plan: 'info' };

function actualizarAvisos() {
  const ul = document.getElementById('avisos');
  const visibles = refs.avisos.filter((a) => a.hora <= hora + 1e-6);
  while (ul.children.length > visibles.length) ul.lastChild.remove();
  for (let i = ul.children.length; i < visibles.length; i++) {
    const a = visibles[i];
    const li = el('li', 'alerta-item alerta-item--' + a.tipo);
    const ic = el('span', 'alerta-item__icono');
    ic.appendChild(icono(ICONO[a.tipo]));
    const tx = el('div');
    tx.append(el('strong', null, textoHora(a.hora) + ' · ' + a.titulo), el('p', null, a.texto));
    li.append(ic, tx);
    ul.appendChild(li);
  }
}

function pintar() {
  const c = conteoA(hora, dia);
  refs.hora.valor.textContent = textoHora(hora);
  refs.hora.nota.textContent = hora >= dia.cierre ? 'Fiesta cerrada' : hora <= dia.apertura ? 'Abre a las ' + dia.apertura + ':00' : 'Fiesta en marcha';
  refs.entrada.valor.textContent = numero(c.llegadas);
  refs.entrada.nota.textContent = 'de ' + numero(dia.total) + ' previstos';
  refs.dentro.valor.textContent = numero(c.dentro);
  const pct = c.dentro / dia.aforo;
  refs.dentro.nota.textContent = porcentaje(Math.round(pct * 100)) + ' del aforo de ' + numero(dia.aforo);
  refs.dentro.barra.style.setProperty('--v', Math.min(100, pct * 100) + '%');
  refs.dentro.caja.classList.toggle('dato--alerta', pct >= 0.8);
  refs.vasos.valor.textContent = numero(c.vasosQuedan);
  const bajo = c.vasosQuedan <= dia.vasos * 0.15;
  refs.vasos.nota.textContent = (bajo ? 'Atención: ' : '') + 'de ' + numero(dia.vasos) + ' preparados';
  refs.vasos.caja.classList.toggle('dato--alerta', bajo);
  document.getElementById('hora-texto').textContent = textoHora(hora);
  const r = document.getElementById('hora');
  r.value = String(hora);
  r.setAttribute('aria-valuetext', textoHora(hora));

  for (const b of refs.barras) {
    const parte = Math.max(0, Math.min(1, hora - b.hora));
    const alto = b.alto * parte;
    b.lleno.setAttribute('y', b.base - alto);
    b.lleno.setAttribute('height', alto);
  }
  for (const p of refs.proc) {
    p.b.style.setProperty('--v', (p.pct / 32) * 100 * (c.llegadas / dia.total) + '%');
    p.n.textContent = numero(Math.round((c.llegadas * p.pct) / 100));
  }
  actualizarAvisos();
}

function botonReproducir() {
  const b = document.getElementById('reproducir');
  b.textContent = '';
  b.append(icono(reproduciendo ? 'pausa' : 'reproducir'), reproduciendo ? 'Pausa' : 'Reproducir el día');
}

function paso(ts) {
  if (!reproduciendo) return;
  if (ultimo !== null) {
    const velocidad = Number(document.getElementById('velocidad').value); // minutos por segundo
    hora = Math.min(dia.cierre, hora + ((ts - ultimo) / 1000) * (velocidad / 60));
    pintar();
  }
  ultimo = ts;
  if (hora >= dia.cierre) { parar(); return; }
  requestAnimationFrame(paso);
}

function reproducir() {
  if (hora >= dia.cierre) hora = dia.apertura;
  reproduciendo = true;
  ultimo = null;
  botonReproducir();
  requestAnimationFrame(paso);
}
function parar() { reproduciendo = false; botonReproducir(); }

datos('conteo')
  .then((d) => {
    dia = d;
    hora = d.apertura;
    const r = document.getElementById('hora');
    r.min = String(d.apertura);
    r.max = String(d.cierre);
    r.addEventListener('input', () => { parar(); hora = Number(r.value); pintar(); });
    crearContadores();
    crearGrafico();
    crearProcedencia();
    refs.avisos = calcularAvisos();
    document.getElementById('reproducir').addEventListener('click', () => (reproduciendo ? parar() : reproducir()));
    document.getElementById('reiniciar').addEventListener('click', () => { parar(); hora = d.apertura; pintar(); });
    document.getElementById('metodo').textContent = 'Cómo se cuenta: ' + d.metodo + ' Simulación con la previsión de ' + numero(d.total) + ' asistentes.';
    botonReproducir();
    // Sin animación, se muestra el día completo
    if (reducirMovimiento()) hora = d.cierre;
    pintar();
    document.addEventListener('aljibe:accion', (e) => { if (e.detail === 'reproducir') { hora = d.apertura; reproducir(); } });
    listo();
  })
  .catch(mostrarError);
