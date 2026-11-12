// Exposición en 10 diapositivas. El contenido sale de datos/exposicion.json y
// las cifras del prototipo, de datos/fiesta-2027.json (no se duplican).
//   → Espacio Av Pág: siguiente · ← Re Pág: anterior · Inicio/Fin · 1–9, 0: ir a
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

// Marca un elemento para que entre en orden (--i) al mostrarse la diapositiva
function entra(nodo, i) {
  nodo.classList.add('entra');
  nodo.style.setProperty('--i', i);
  return nodo;
}

function cifra(valor, clase, sufijo = '', prefijo = '') {
  // En cifras grandes el espacio normal antes de % o € queda enorme: se usa uno fino
  sufijo = sufijo.replace(/^ /, '\u202F');
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
  const cab = el('header', 'diapo__cabecera');
  const et = el('p', 'etiqueta');
  et.append(el('span', 'etiqueta__num', String(n).padStart(2, '0')), el('span', null, d.etiqueta));
  cab.append(et, logo(oscura ? 'aljibe-wordmark-inverse.svg' : 'aljibe-mark.svg', 'marca'));
  if (oscura) cab.lastChild.style.width = '150px';
  s.appendChild(cab);
  return s;
}

function titular(texto, i = 0) {
  return entra(el('h2', 'titular', texto), i);
}

function cuerpo(clase) {
  return el('div', 'diapo__cuerpo ' + clase);
}

function fuente(texto) {
  return texto ? el('p', 'fuente', texto) : null;
}

// ---------- Tipos de diapositiva ----------

const TIPOS = {
  portada(d, s) {
    s.classList.add('portada');
    s.querySelector('.diapo__cabecera').remove();
    s.prepend(el('div', 'portada__arco'));
    const arriba = el('div');
    arriba.style.display = 'grid';
    arriba.style.gap = '56px';
    arriba.append(entra(logo('aljibe-lockup-inverse.svg', 'portada__logo', 'ALJIBE'), 0));
    const h = entra(el('h1', 'portada__claim', d.titular), 1);
    arriba.append(h, entra(el('p', 'portada__sub', d.subtitulo), 2));
    const abajo = el('div');
    abajo.style.display = 'grid';
    abajo.style.gap = '36px';
    abajo.append(entra(el('p', 'portada__origen', d.origen), 3));
    const pie = entra(el('p', 'portada__pie'), 4);
    pie.append(el('span', 'chip chip--claro', d.etiqueta), el('span', null, d.pie));
    abajo.append(pie);
    s.append(arriba, abajo);
  },

  problema(d, s) {
    s.append(titular(d.titular));
    const c = cuerpo('problema');
    const cifras = el('div', 'problema__cifras');
    const a = entra(el('div'), 1);
    a.append(cifra(d.cifra.valor, 'cifra--xl'), el('p', 'cifra-texto', d.cifra.texto));
    const b = entra(el('div'), 2);
    b.append(cifra(d.cifra2.valor, 'cifra--l', d.cifra2.sufijo), el('p', 'cifra-texto', d.cifra2.texto));
    cifras.append(a, b);

    const lado = entra(el('div', 'tarjeta problema__datos'), 3);
    lado.append(el('p', 'subtitulo', 'Tienen datos'));
    const fd = el('ul', 'fuentes-datos');
    d.fuentesDatos.forEach((f) => {
      const li = el('li', 'fuente-dato');
      li.append(iconoRedondo(f.icono), el('span', null, f.texto));
      fd.appendChild(li);
    });
    const flecha = el('p', 'problema__flecha');
    flecha.append(icono('alerta'), el('span', null, 'pero nadie los cruza, y se decide a ojo:'));
    const dec = el('ul', 'decisiones');
    d.decisiones.forEach((t) => dec.appendChild(el('li', 'decision', t)));
    lado.append(fd, flecha, dec);
    c.append(cifras, lado);
    s.append(c, fuente(d.fuente));
  },

  proceso(d, s) {
    s.append(titular(d.titular));
    const c = cuerpo('proceso');
    const pasos = el('ol', 'pasos');
    d.pasos.forEach((p, i) => {
      const li = entra(el('li', 'tarjeta paso' + (i === d.pasos.length - 1 ? ' paso--final' : '')), i + 1);
      const fila = el('div');
      fila.style.cssText = 'display:flex;justify-content:space-between;align-items:center';
      fila.append(iconoRedondo(p.icono), el('span', 'paso__num', String(i + 1).padStart(2, '0')));
      li.append(fila, el('h3', 'paso__nombre', p.nombre), el('p', 'paso__texto', p.texto));
      pasos.appendChild(li);
    });
    const serv = entra(el('div', 'servicios-fila'), 5);
    serv.append(el('p', 'subtitulo', d.servicios.length + ' servicios'));
    d.servicios.forEach((t) => serv.appendChild(el('span', 'chip', t)));
    serv.appendChild(el('span', 'chip chip--contorno', d.gratis));
    c.append(pasos, serv);
    s.append(c);
  },

  prototipo(d, s, f) {
    s.append(titular(d.titular));
    const c = cuerpo('prototipo');
    const p = f.prevision;
    const principal = el('div', 'prototipo__principal');
    principal.append(entra(el('p', 'chip chip--contorno', d.chip), 1));
    principal.append(entra(cifra(p.central, 'cifra--xl'), 2));
    principal.append(entra(el('p', 'cifra-texto', 'asistentes previstos, entre ' + numero(p.minimo) + ' y ' + numero(p.maximo)), 3));
    // Barra de rango: el tramo probable y el valor central
    const pos = (x) => ((x - p.escalaMin) / (p.escalaMax - p.escalaMin)) * 100;
    const rango = entra(el('div', 'rango-diapo'), 4);
    rango.setAttribute('role', 'img');
    rango.setAttribute('aria-label', 'Rango de la previsión: entre ' + numero(p.minimo) + ' y ' + numero(p.maximo) + ', valor central ' + numero(p.central));
    const barra = el('div', 'rango-diapo__barra');
    const tramo = el('span', 'rango-diapo__tramo crece');
    tramo.style.left = pos(p.minimo) + '%';
    tramo.style.width = pos(p.maximo) - pos(p.minimo) + '%';
    const marca = el('span', 'rango-diapo__marca');
    marca.style.left = 'calc(' + pos(p.central) + '% - 3px)';
    barra.append(tramo, marca);
    const eje = el('div', 'rango-diapo__eje');
    [p.minimo, p.central, p.maximo].forEach((v) => {
      const e = el('span', null, numero(v));
      e.style.left = pos(v) + '%';
      eje.appendChild(e);
    });
    rango.append(barra, eje);
    principal.append(rango);

    const rec = f.fechas.find((x) => x.id === f.fechaRecomendada.dia) || f.fechas[0];
    const lado = el('div', 'prototipo__lado');
    const fecha = entra(el('div', 'panel mini-kpi'), 5);
    fecha.append(el('p', 'mini-kpi__titulo', 'Fecha recomendada'), cifra(Number(f.fechaRecomendada.dia), 'cifra--l', ' ' + f.fechaRecomendada.mes, ''));
    fecha.append(el('p', 'mini-kpi__texto', rec.dia + ' de ' + rec.mes + ': ' + rec.resumen.toLowerCase() + ', ' + f.fechaRecomendada.puntos + '/100'));
    const vasos = entra(el('div', 'tarjeta mini-kpi'), 6);
    vasos.append(el('p', 'mini-kpi__titulo', 'Vasos que preparar'), cifra(f.vasos.cantidad, 'cifra--l'), el('p', 'mini-kpi__texto', f.vasos.nota.join(' ')));
    lado.append(fecha, vasos);
    c.append(principal, lado);
    const web = el('p', 'fuente');
    web.append('Pruébalo en ', el('span', 'web-chip', expo.web));
    s.append(c, web);
  },

  comparativa(d, s) {
    s.append(titular(d.titular));
    const c = cuerpo('comparativa');
    d.columnas.forEach((col, i) => {
      const caja = entra(el('div', (col.destacado ? 'panel columna--destacada ' : 'tarjeta ') + 'columna'), i + 1);
      caja.append(el('h3', 'columna__nombre', col.nombre), el('p', 'columna__ejemplo', col.ejemplo));
      const ul = el('ul', 'lista');
      col.puntos.forEach((t) => ul.appendChild(check(t)));
      caja.append(ul);
      if (!col.destacado) caja.querySelectorAll('.check .ico').forEach((ic) => { ic.innerHTML = '<path d="M5 12h14"/>'; });
      c.appendChild(caja);
    });
    s.append(c, fuente(d.fuente));
  },

  clientes(d, s) {
    s.append(titular(d.titular));
    const c = cuerpo('clientes');
    const izq = el('div', 'clientes__cifra');
    izq.append(entra(cifra(d.cifra.valor, 'cifra--xl'), 1), entra(el('p', 'cifra-texto', d.cifra.texto), 2), entra(el('p', 'cifra-texto texto-suave', d.cifraNota), 3));
    const seg = el('ul', 'segmentos');
    d.segmentos.forEach((x, i) => {
      const li = entra(el('li', 'segmento ' + (x.principal ? 'panel' : 'tarjeta')), i + 2);
      const t = el('div');
      t.append(el('p', 'segmento__nombre', x.nombre), el('p', 'segmento__texto', x.texto));
      li.append(iconoRedondo(x.icono), t);
      seg.appendChild(li);
    });
    const val = entra(el('div', 'tarjeta validacion'), 5);
    const vl = el('ul');
    vl.style.cssText = 'display:contents';
    d.validacion.forEach((t) => vl.appendChild(check(t)));
    val.append(el('p', 'subtitulo', 'Cómo lo validamos'), vl);
    c.append(izq, seg, val);
    s.append(c, fuente(d.fuente));
  },

  impacto(d, s) {
    s.append(titular(d.titular));
    const c = cuerpo('impacto');
    const lista = el('ul', 'impactos');
    d.impactos.forEach((x, i) => {
      const li = entra(el('li', 'tarjeta impacto-fila'), i + 1);
      const txt = el('div');
      txt.append(el('span', 'impacto-fila__tipo', x.tipo), el('span', 'impacto-fila__texto', x.texto));
      li.append(iconoRedondo(x.icono), el('p', 'cifra cifra--m', x.cifra), txt);
      lista.appendChild(li);
    });
    const k = d.capitalidad;
    const panel = entra(el('div', 'panel capitalidad'), 4);
    panel.append(el('p', 'capitalidad__titulo', k.titulo), el('p', 'capitalidad__texto', k.texto), el('p', 'capitalidad__dato', k.dato), el('p', 'capitalidad__propuesta', k.propuesta));
    c.append(lista, panel);
    s.append(c, fuente(d.fuente));
  },

  finanzas(d, s) {
    s.append(titular(d.titular));
    const c = cuerpo('finanzas');
    const izq = el('div', 'finanzas__principal');
    izq.append(entra(cifra(d.cifra.valor, 'cifra--xl', d.cifra.sufijo), 1), entra(el('p', 'cifra-texto', d.cifra.texto), 2));
    const total = d.desglose.reduce((a, x) => a + x.valor, 0);
    const colores = ['var(--aljibe)', 'var(--agua)', '#7FA9B0'];
    const des = entra(el('div', 'desglose'), 3);
    const barra = el('div', 'desglose__barra');
    barra.setAttribute('role', 'img');
    barra.setAttribute('aria-label', d.desglose.map((x) => x.texto + ': ' + numero(x.valor) + ' €').join('; '));
    d.desglose.forEach((x, i) => {
      const t = el('span', 'crece');
      t.style.flex = String(x.valor / total);
      t.style.background = colores[i];
      barra.appendChild(t);
    });
    des.appendChild(barra);
    d.desglose.forEach((x, i) => {
      const fila = el('div', 'desglose__fila');
      const punto = el('span', 'desglose__punto');
      punto.style.background = colores[i];
      fila.append(punto, el('span', null, x.texto), el('span', 'desglose__calculo', x.calculo), el('span', 'desglose__valor', numero(x.valor) + ' €'));
      des.appendChild(fila);
    });
    izq.append(des);
    const lado = el('div', 'finanzas__lado');
    d.lado.forEach((x, i) => {
      const t = entra(el('div', i === 1 ? 'panel' : 'tarjeta'), i + 4);
      t.append(el('p', 'mini-kpi__titulo', x.titulo), el('p', 'cifra cifra--m', x.cifra), el('p', 'mini-kpi__texto', x.texto));
      lado.appendChild(t);
    });
    c.append(izq, lado);
    s.append(c, fuente(d.fuente));
  },

  hoja(d, s) {
    s.append(titular(d.titular));
    const c = cuerpo('hoja');
    const hitos = el('ol', 'hitos');
    hitos.classList.add('crece-linea');
    d.hitos.forEach((h, i) => {
      const li = entra(el('li', 'hito' + (i === 1 ? ' hito--clave' : '')), i + 1);
      li.append(el('p', 'hito__cuando', h.cuando), el('p', 'hito__texto', h.texto));
      hitos.appendChild(li);
    });
    const cols = el('div', 'hoja__columnas');
    const porque = entra(el('div', 'tarjeta'), 5);
    porque.append(el('p', 'subtitulo', 'Por qué es factible'));
    const ul1 = el('ul', 'lista');
    d.porque.forEach((t) => ul1.appendChild(check(t)));
    porque.append(ul1);
    const nec = entra(el('div', 'panel'), 6);
    nec.append(el('p', 'subtitulo', 'Qué necesitamos para despegar'));
    const ul2 = el('ul', 'lista');
    d.necesitamos.forEach((t) => ul2.appendChild(check(t)));
    nec.append(ul2);
    cols.append(porque, nec);
    c.append(hitos, cols);
    s.append(c);
  },

  cierre(d, s) {
    s.classList.add('cierre');
    s.querySelector('.marca').remove(); // el logo ya va abajo, grande
    // La frase de cierre resalta la segunda parte: el porqué
    const h = entra(el('h2', 'cierre__frase'), 0);
    const [antes, despues] = d.titular.split(', porque ');
    h.append(antes + ', ');
    h.append(el('em', null, 'porque ' + despues));
    const equipo = el('div', 'equipo');
    equipo.append(entra(el('p', 'subtitulo', 'Equipo 3 · ' + d.capacidades.join(' · ')), 1));
    const mi = entra(el('ul', 'equipo__miembros'), 2);
    d.miembros.forEach((m) => mi.appendChild(el('li', 'chip chip--claro', m)));
    equipo.append(mi);
    const pie = entra(el('div', 'cierre__pie'), 3);
    const web = el('p', 'web-chip', expo.web);
    web.style.color = '#DCEBEE';
    pie.append(logo('aljibe-lockup-inverse.svg', 'cierre__logo', 'ALJIBE'), web);
    s.append(h, equipo, pie);
  }
};

// ---------- Navegación ----------

function escalar() {
  const e = Math.min(window.innerWidth / ANCHO, window.innerHeight / ALTO);
  document.documentElement.style.setProperty('--escala', e.toFixed(4));
}

// Las cifras cuentan desde cero al entrar (máximo 600 ms)
function contar(s) {
  if (reducirMovimiento() || imprimir) return;
  s.querySelectorAll('.cifra[data-valor]').forEach((c) => {
    const fin = Number(c.dataset.valor);
    const t0 = performance.now();
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / 600);
      const v = Math.round(fin * (1 - Math.pow(1 - k, 3)));
      c.textContent = c.dataset.prefijo + numero(v) + c.dataset.sufijo;
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  });
}

function ir(n) {
  n = Math.max(0, Math.min(diapos.length - 1, n));
  diapos.forEach((s, i) => {
    const activa = i === n;
    s.classList.toggle('activa', activa);
    s.setAttribute('aria-hidden', String(!activa));
    s.inert = !activa;
  });
  if (n !== actual || !diapos[n].dataset.vista) { contar(diapos[n]); diapos[n].dataset.vista = '1'; }
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
  else if (/^[0-9]$/.test(k)) { e.preventDefault(); ir(k === '0' ? 9 : Number(k) - 1); }
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
      const oscura = d.tipo === 'portada' || d.tipo === 'cierre';
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
