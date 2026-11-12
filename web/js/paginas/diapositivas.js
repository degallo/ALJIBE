// Exposición de 4 minutos: una diapositiva por cada contenido mínimo de las
// indicaciones de Granada 2031. El texto sale de datos/exposicion.json y las
// cifras del prototipo, de datos/fiesta-2027.json (no se duplican).
//   → Espacio Av Pág: siguiente · ← Re Pág: anterior · Inicio/Fin · 1–9: ir a
//   N: notas · T: cronómetro de 4 minutos · F: pantalla completa
import { datos } from '../nucleo/api.js';
import { el, icono, raiz, reducirMovimiento } from '../nucleo/dom.js';
import { numero } from '../nucleo/formato.js';

const ANCHO = 1920;
const ALTO = 1080;
const imprimir = new URLSearchParams(location.search).has('imprimir');

let diapos = [];
let actual = 0;
let expo;

// ---------- Piezas ----------

// Marca un elemento para que entre en orden (--i) al mostrarse la diapositiva.
// efecto: sube (por defecto), pop, izquierda, derecha o enfoque
function entra(nodo, i, efecto = 'sube') {
  nodo.classList.add('entra');
  nodo.dataset.efecto = efecto;
  nodo.style.setProperty('--i', i);
  return nodo;
}

// Varios hijos que entran uno tras otro, a partir de un orden dado
function enCadena(hijos, desde, efecto = 'pop') {
  [...hijos].forEach((h, k) => entra(h, desde + k * 0.5, efecto));
}

function cifra(valor, clase, sufijo = '', prefijo = '') {
  // En cifras grandes el espacio normal antes de % o € queda enorme: se usa uno fino
  sufijo = sufijo.replace(/^ /, ' ');
  const c = el('p', 'cifra ' + clase, prefijo + numero(valor) + sufijo);
  c.dataset.valor = valor;
  c.dataset.sufijo = sufijo;
  c.dataset.prefijo = prefijo;
  return c;
}

function check(texto) {
  const li = el('li', 'check');
  li.append(icono('check'), el('span', null, texto));
  return li;
}

function lista(textos, desde) {
  const ul = el('ul', 'lista');
  textos.forEach((t) => ul.appendChild(check(t)));
  enCadena(ul.children, desde, 'izquierda');
  return ul;
}

function iconoRedondo(nombre) {
  const r = el('span', 'icono-redondo');
  r.appendChild(icono(nombre));
  return r;
}

function logo(nombre, clase, alt = '') {
  const img = el('img', clase);
  img.src = raiz() + 'logos/' + nombre;
  img.alt = alt;
  return img;
}

function marco(d, n, total, oscura = false) {
  const s = el('section', 'diapo' + (oscura ? ' diapo--oscura' : ''));
  s.id = 'd' + n;
  s.setAttribute('role', 'group');
  s.setAttribute('aria-roledescription', 'diapositiva');
  s.setAttribute('aria-label', n + ' de ' + total + ': ' + d.etiqueta);
  s.appendChild(el('span', 'diapo__brillo'));
  const cab = el('header', 'diapo__cabecera');
  const et = entra(el('p', 'etiqueta'), 0, 'izquierda');
  et.append(el('span', 'etiqueta__num', String(n).padStart(2, '0')), el('span', null, d.etiqueta));
  cab.append(et, logo(oscura ? 'aljibe-wordmark-inverse.svg' : 'aljibe-mark.svg', 'marca'));
  if (oscura) cab.lastChild.style.width = '150px';
  s.appendChild(cab);
  return s;
}

// El titular aparece palabra a palabra, como si subiera desde una línea
function palabras(nodo, texto, desde = 0) {
  nodo.setAttribute('aria-label', texto);
  texto.split(' ').forEach((p, k) => {
    const caja = el('span', 'palabra');
    caja.setAttribute('aria-hidden', 'true');
    const dentro = el('span', 'palabra__in', p);
    dentro.style.setProperty('--w', desde + k);
    caja.appendChild(dentro);
    nodo.append(caja, ' ');
  });
  return nodo;
}

function titular(texto) {
  return palabras(el('h2', 'titular'), texto);
}

function cuerpo(clase) {
  return el('div', 'diapo__cuerpo ' + clase);
}

function fuente(texto, i = 9) {
  return texto ? entra(el('p', 'fuente', texto), i, 'enfoque') : null;
}

// ---------- Tipos de diapositiva ----------

const TIPOS = {
  portada(d, s) {
    s.classList.add('portada');
    s.querySelector('.marca').remove(); // el logo va grande debajo
    s.prepend(el('div', 'portada__arco'));
    const arriba = el('div', 'portada__arriba');
    arriba.append(entra(logo('aljibe-lockup-inverse.svg', 'portada__logo', 'ALJIBE'), 1, 'pop'));
    arriba.append(palabras(el('h1', 'portada__claim'), d.titular, 3));
    const prop = entra(el('p', 'portada__sub'), 6, 'enfoque');
    prop.append(el('span', 'portada__etiqueta', 'Propuesta central'), d.propuesta);
    arriba.append(prop);
    const abajo = el('div', 'portada__abajo');
    abajo.append(entra(el('p', 'portada__origen', d.origen), 7));
    abajo.append(entra(el('p', 'portada__pie', d.pie), 8));
    s.append(arriba, abajo);
  },

  problema(d, s) {
    s.append(titular(d.titular));
    const c = cuerpo('problema');
    const cifras = el('div', 'problema__cifras');
    const a = entra(el('div'), 2, 'pop');
    a.append(cifra(d.cifra.valor, 'cifra--xl'), el('p', 'cifra-texto', d.cifra.texto));
    cifras.append(a);

    const lado = el('div', 'problema__lado');
    const nec = entra(el('div', 'tarjeta problema__bloque'), 4, 'derecha');
    const fuentes = el('ul', 'chips');
    d.necesidad.fuentes.forEach((t) => fuentes.appendChild(el('li', 'chip chip--suelto', t)));
    enCadena(fuentes.children, 5);
    const aviso = el('p', 'problema__flecha');
    aviso.append(icono('alerta'), el('span', null, d.necesidad.texto));
    nec.append(el('p', 'subtitulo', d.necesidad.titulo), fuentes, aviso);
    const mer = entra(el('div', 'panel problema__bloque'), 6, 'derecha');
    mer.append(el('p', 'subtitulo', d.merece.titulo), lista(d.merece.puntos, 7));
    lado.append(nec, mer);
    c.append(cifras, lado);
    s.append(c, fuente(d.fuente));
  },

  proceso(d, s, f) {
    s.append(titular(d.titular));
    const c = cuerpo('proceso');
    const pasos = el('ol', 'pasos');
    d.pasos.forEach((p, i) => {
      const li = entra(el('li', 'tarjeta paso' + (i === d.pasos.length - 1 ? ' paso--final' : '')), 2 + i * 0.7, 'pop');
      const fila = el('div', 'paso__fila');
      fila.append(iconoRedondo(p.icono), el('span', 'paso__num', String(i + 1).padStart(2, '0')));
      li.append(fila, el('h3', 'paso__nombre', p.nombre), el('p', 'paso__texto', p.texto));
      pasos.appendChild(li);
    });
    const abajo = el('div', 'proceso__abajo');
    const serv = entra(el('div', 'servicios'), 5, 'izquierda');
    serv.append(el('p', 'subtitulo', 'Qué ofrecemos: ' + d.servicios.length + ' servicios'));
    const chips = el('div', 'chips');
    d.servicios.forEach((t) => chips.appendChild(el('span', 'chip', t)));
    chips.appendChild(el('span', 'chip chip--contorno', d.gratis));
    enCadena(chips.children, 5.5);
    serv.appendChild(chips);

    // El prototipo, como prueba de cómo funciona
    const rec = f.fechas.find((x) => x.id === f.fechaRecomendada.dia) || f.fechas[0];
    const ej = entra(el('div', 'panel ejemplo'), 7, 'derecha');
    ej.append(el('p', 'subtitulo', d.ejemplo));
    const kpis = el('div', 'ejemplo__kpis');
    [
      [cifra(f.prevision.central, 'cifra--s'), 'asistentes'],
      [el('p', 'cifra cifra--s', f.fechaRecomendada.dia + ' ' + f.fechaRecomendada.mes), rec.resumen.toLowerCase()],
      [cifra(f.vasos.cantidad, 'cifra--s'), 'vasos']
    ].forEach(([n, t], k) => {
      const k1 = entra(el('div', 'ejemplo__kpi'), 8 + k * 0.6, 'pop');
      k1.append(n, el('span', null, t));
      kpis.appendChild(k1);
    });
    ej.append(kpis);
    abajo.append(serv, ej);
    c.append(pasos, abajo);
    s.append(c);
  },

  comparativa(d, s) {
    s.append(titular(d.titular));
    const c = cuerpo('comparativa');
    const efectos = ['izquierda', 'pop', 'derecha'];
    d.columnas.forEach((col, i) => {
      const caja = entra(el('div', (col.destacado ? 'panel columna--destacada ' : 'tarjeta ') + 'columna'), col.destacado ? 4 : 2 + i * 0.6, efectos[i]);
      caja.append(el('h3', 'columna__nombre', col.nombre), el('p', 'columna__ejemplo', col.ejemplo));
      const ul = lista(col.puntos, col.destacado ? 5 : 3 + i * 0.6);
      if (!col.destacado) ul.querySelectorAll('.check .ico').forEach((ic) => { ic.innerHTML = '<path d="M5 12h14"/>'; });
      caja.append(ul);
      c.appendChild(caja);
    });
    s.append(c, fuente(d.fuente));
  },

  clientes(d, s) {
    s.append(titular(d.titular));
    const c = cuerpo('clientes');
    const seg = el('ul', 'segmentos');
    d.segmentos.forEach((x, i) => {
      const li = entra(el('li', 'segmento ' + (x.principal ? 'panel' : 'tarjeta')), 2 + i * 0.8, 'pop');
      const cab = el('div', 'segmento__cab');
      cab.append(iconoRedondo(x.icono));
      if (x.principal) cab.append(el('span', 'chip chip--claro segmento__prioridad', 'Prioritario'));
      li.append(cab, el('h3', 'segmento__nombre', x.nombre), el('p', 'segmento__quien', x.quien));
      const pq = el('div', 'segmento__porque');
      pq.append(el('p', 'subtitulo', 'Por qué comprarían'), el('p', 'segmento__texto', x.porque));
      li.append(pq);
      seg.appendChild(li);
    });
    const val = entra(el('div', 'tarjeta validacion'), 5, 'sube');
    const vl = el('ul', 'validacion__lista');
    d.validacion.forEach((t) => vl.appendChild(check(t)));
    enCadena(vl.children, 5.5, 'izquierda');
    val.append(el('p', 'subtitulo', 'Cómo los validamos'), vl);
    c.append(seg, val);
    s.append(c, fuente(d.fuente));
  },

  impacto(d, s, f) {
    s.append(titular(d.titular));
    const c = cuerpo('impacto');
    const filas = el('ul', 'impactos');
    // Los valores salen del prototipo: vasos e indicadores de impacto de la fiesta
    const valor = (dato) => {
      if (dato === 'vasos') return cifra(f.vasos.cantidad, 'cifra--m');
      const x = f.impacto.find((k) => k.nombre === dato);
      return cifra(x.valor, 'cifra--m', x.unidad ? ' ' + x.unidad : '');
    };
    d.impactos.forEach((x, i) => {
      const li = entra(el('li', 'tarjeta impacto-fila'), 2 + i * 0.8, 'izquierda');
      const txt = el('div');
      txt.append(el('span', 'impacto-fila__tipo', x.tipo), el('span', 'impacto-fila__texto', x.texto));
      li.append(iconoRedondo(x.icono), valor(x.dato), txt);
      filas.appendChild(li);
    });
    const k = d.capitalidad;
    const panel = entra(el('div', 'panel capitalidad'), 4, 'derecha');
    const dims = el('ul', 'capitalidad__dims');
    k.dimensiones.forEach((t) => dims.appendChild(el('li', 'chip chip--claro', t)));
    enCadena(dims.children, 5);
    panel.append(el('p', 'capitalidad__titulo', k.titulo), el('p', 'capitalidad__texto', k.texto), dims, entra(el('p', 'capitalidad__propuesta', k.propuesta), 7, 'enfoque'));
    c.append(filas, panel);
    s.append(c, fuente(d.fuente));
  },

  finanzas(d, s) {
    s.append(titular(d.titular));
    const c = cuerpo('finanzas');
    const izq = el('div', 'finanzas__principal');
    const a = entra(el('div'), 2, 'pop');
    a.append(el('p', 'subtitulo', 'Objetivo año 1'), cifra(d.cifra.valor, 'cifra--xl', d.cifra.sufijo), el('p', 'cifra-texto', d.cifra.texto));
    const b = entra(el('div', 'finanzas__recurrente'), 3, 'sube');
    b.append(cifra(d.cifra2.valor, 'cifra--m', d.cifra2.sufijo), el('p', 'cifra-texto', d.cifra2.texto));
    izq.append(a, b);
    const rejilla = el('div', 'finanzas__bloques');
    d.bloques.forEach((x, i) => {
      const t = entra(el('div', (x.destacado ? 'panel' : 'tarjeta') + ' bloque'), 4 + i * 0.6, 'pop');
      const cab = el('div', 'bloque__cab');
      cab.append(iconoRedondo(x.icono), el('h3', 'bloque__titulo', x.titulo));
      t.append(cab, el('p', 'bloque__texto', x.texto));
      rejilla.appendChild(t);
    });
    c.append(izq, rejilla);
    s.append(c, fuente(d.fuente));
  },

  hoja(d, s) {
    s.append(titular(d.titular));
    const c = cuerpo('hoja');
    const hitos = el('ol', 'hitos');
    d.hitos.forEach((h, i) => {
      const li = entra(el('li', 'hito' + (i === 1 ? ' hito--clave' : '')), 2 + i * 0.7, 'sube');
      li.append(el('p', 'hito__cuando', h.cuando), el('p', 'hito__texto', h.texto));
      hitos.appendChild(li);
    });
    const cols = el('div', 'hoja__columnas');
    const porque = entra(el('div', 'tarjeta'), 5, 'izquierda');
    porque.append(el('p', 'subtitulo', 'Por qué es factible'), lista(d.porque, 5.5));
    const nec = entra(el('div', 'panel'), 6, 'derecha');
    nec.append(el('p', 'subtitulo', 'Qué necesitamos para despegar'), lista(d.necesitamos, 6.5));
    cols.append(porque, nec);
    c.append(hitos, cols);
    s.append(c);
  },

  equipo(d, s) {
    s.querySelector('.marca').remove(); // el logo ya cierra la diapositiva
    s.append(titular(d.titular));
    const c = cuerpo('equipo');
    const caps = el('ul', 'capacidades');
    d.capacidades.forEach((x, i) => {
      const li = entra(el('li', 'capacidad'), 2 + i * 0.6, 'pop');
      const t = el('div');
      t.append(el('p', 'capacidad__nombre', x.nombre), el('p', 'capacidad__texto', x.texto));
      li.append(iconoRedondo(x.icono), t);
      caps.appendChild(li);
    });
    const mi = el('ul', 'equipo__miembros');
    d.miembros.forEach((m) => mi.appendChild(el('li', 'chip chip--claro', m)));
    enCadena(mi.children, 4);
    // Cierre recomendado: «Nuestro proyecto cambiará ___ porque ___»
    const cierre = entra(el('div', 'cierre'), 7, 'enfoque');
    const frase = el('p', 'cierre__frase');
    const [antes, despues] = d.cierre.split(', porque ');
    frase.append(antes + ', ', el('em', null, 'porque ' + despues));
    cierre.append(frase, logo('aljibe-lockup-inverse.svg', 'cierre__logo', 'ALJIBE'));
    c.append(caps, mi, cierre);
    s.append(c);
  }
};

// ---------- Navegación ----------

function escalar() {
  const e = Math.min(window.innerWidth / ANCHO, window.innerHeight / ALTO);
  document.documentElement.style.setProperty('--escala', e.toFixed(4));
}

// Las cifras cuentan desde cero al entrar (máximo 600 ms)
// Las cifras cuentan desde cero al entrar, a la vez que aparecen
function contar(s) {
  if (reducirMovimiento() || imprimir) return;
  s.querySelectorAll('.cifra[data-valor]').forEach((c) => {
    const fin = Number(c.dataset.valor);
    const t0 = performance.now() + 250;
    c.textContent = c.dataset.prefijo + '0' + c.dataset.sufijo;
    const paso = (t) => {
      const k = Math.max(0, Math.min(1, (t - t0) / 1100));
      const v = Math.round(fin * (1 - Math.pow(1 - k, 3)));
      c.textContent = c.dataset.prefijo + numero(v) + c.dataset.sufijo;
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  });
}

function ir(n) {
  n = Math.max(0, Math.min(diapos.length - 1, n));
  const primera = !diapos[n].dataset.vista;
  if (n === actual && !primera) return;
  // La dirección decide hacia dónde se desliza: adelante entra por la derecha
  document.getElementById('escenario').dataset.dir = n >= actual ? 'adelante' : 'atras';
  const anterior = diapos[actual];
  if (anterior && anterior !== diapos[n]) {
    anterior.classList.add('sale');
    setTimeout(() => anterior.classList.remove('sale'), 800);
  }
  diapos.forEach((s, i) => {
    const activa = i === n;
    s.classList.toggle('activa', activa);
    s.setAttribute('aria-hidden', String(!activa));
    s.inert = !activa;
  });
  diapos[n].classList.remove('sale');
  contar(diapos[n]);
  diapos[n].dataset.vista = '1';
  actual = n;
  const d = expo.diapositivas[n];
  document.getElementById('contador').textContent = n + 1 + '/' + diapos.length;
  document.getElementById('progreso').style.setProperty('--p', (n + 1) / diapos.length);
  document.getElementById('notas').textContent = d.nota;
  document.getElementById('anuncio').textContent = 'Diapositiva ' + (n + 1) + ' de ' + diapos.length + ': ' + d.etiqueta;
  document.getElementById('anterior').disabled = n === 0;
  document.getElementById('siguiente').disabled = n === diapos.length - 1;
  document.title = d.etiqueta + ' · Exposición ALJIBE';
  history.replaceState(null, '', '#' + (n + 1));
}

function alternarNotas() {
  const notas = document.getElementById('notas');
  notas.hidden = !notas.hidden;
  document.getElementById('boton-notas').setAttribute('aria-expanded', String(!notas.hidden));
}

function pantallaCompleta() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
  else document.exitFullscreen?.();
}

// Cronómetro: cuenta atrás de 4 minutos; al pasarse, muestra el exceso con signo
let reloj = null;
let inicio = 0;
function pintarReloj() {
  const resto = expo.duracionSegundos - Math.floor((Date.now() - inicio) / 1000);
  const abs = Math.abs(resto);
  const texto = (resto < 0 ? '+' : '') + Math.floor(abs / 60) + ':' + String(abs % 60).padStart(2, '0');
  document.getElementById('reloj-texto').textContent = texto;
  document.getElementById('reloj').classList.toggle('pasado', resto < 0);
}
function alternarReloj() {
  const b = document.getElementById('reloj');
  if (reloj) {
    clearInterval(reloj);
    reloj = null;
    b.setAttribute('aria-pressed', 'false');
    b.classList.remove('pasado');
    document.getElementById('reloj-texto').textContent = Math.floor(expo.duracionSegundos / 60) + ':00';
    return;
  }
  inicio = Date.now();
  reloj = setInterval(pintarReloj, 250);
  b.setAttribute('aria-pressed', 'true');
  pintarReloj();
}

// Los mandos se apartan cuando no se usa el ratón, para no tapar la diapositiva
let reposo;
function despertar() {
  const m = document.getElementById('controles');
  m.classList.remove('mandos--reposo');
  clearTimeout(reposo);
  reposo = setTimeout(() => {
    // Con las notas abiertas, los mandos se quedan a la vista
    if (!m.contains(document.activeElement) && document.getElementById('notas').hidden) m.classList.add('mandos--reposo');
  }, 2500);
}

function teclas(e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const enBoton = e.target.closest && e.target.closest('button, a');
  const k = e.key;
  if (['ArrowRight', 'PageDown'].includes(k) || (k === ' ' && !enBoton)) { e.preventDefault(); ir(actual + 1); }
  else if (['ArrowLeft', 'PageUp'].includes(k)) { e.preventDefault(); ir(actual - 1); }
  else if (k === 'Home') { e.preventDefault(); ir(0); }
  else if (k === 'End') { e.preventDefault(); ir(diapos.length - 1); }
  else if (/^[1-9]$/.test(k)) { e.preventDefault(); ir(Number(k) - 1); }
  else if (k === 'n' || k === 'N') { e.preventDefault(); alternarNotas(); }
  else if (k === 't' || k === 'T') { e.preventDefault(); alternarReloj(); }
  else if (k === 'f' || k === 'F') { e.preventDefault(); pantallaCompleta(); }
}

function prepararMandos() {
  const poner = (id, ico) => document.getElementById(id).prepend(icono(ico));
  poner('salir', 'inicio');
  poner('anterior', 'izquierda');
  poner('siguiente', 'derecha');
  poner('boton-notas', 'notas');
  poner('completa', 'ampliar');
  poner('pdf', 'descarga');
  document.getElementById('pdf').href = raiz() + expo.pdf;
  document.getElementById('anterior').addEventListener('click', () => ir(actual - 1));
  document.getElementById('siguiente').addEventListener('click', () => ir(actual + 1));
  document.getElementById('boton-notas').addEventListener('click', alternarNotas);
  document.getElementById('reloj').addEventListener('click', alternarReloj);
  document.getElementById('completa').addEventListener('click', pantallaCompleta);
  document.addEventListener('keydown', teclas);
  document.addEventListener('pointermove', despertar);

  // Clic en la diapositiva: mitad derecha avanza, mitad izquierda retrocede
  document.getElementById('escenario').addEventListener('click', (e) => {
    if (e.target.closest('a, button')) return;
    ir(e.clientX > window.innerWidth / 3 ? actual + 1 : actual - 1);
  });
  // Deslizar en móvil
  let x0 = null;
  document.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) ir(actual + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  despertar();
}

async function iniciar() {
  if (!imprimir) document.documentElement.classList.add('js-anima');
  try {
    const [e, fiesta] = await Promise.all([datos('exposicion'), datos('fiesta-2027')]);
    expo = e;
    const escenario = document.getElementById('escenario');
    const total = expo.diapositivas.length;
    expo.diapositivas.forEach((d, i) => {
      const oscura = d.tipo === 'portada' || d.tipo === 'equipo';
      const s = marco(d, i + 1, total, oscura);
      TIPOS[d.tipo](d, s, fiesta);
      escenario.appendChild(s);
      diapos.push(s);
    });
    escalar();
    window.addEventListener('resize', escalar);
    prepararMandos();
    const n = Number(location.hash.slice(1)) || 1;
    ir(n - 1);
  } catch (err) {
    const p = el('p', 'sin-js', 'No se ha podido cargar la presentación. ' + err.message);
    document.getElementById('escenario').appendChild(p);
  }
  document.documentElement.classList.add('listo');
}

iniciar();
