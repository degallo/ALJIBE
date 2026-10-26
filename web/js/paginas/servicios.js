// Pantalla Servicios: catálogo con detalle, Paquete Fiesta, Agenda y contacto
import { iniciarMarco, listo, mostrarError } from '../marco.js';
import { datos, comprobarFecha, registrarEvento, enviarContacto } from '../nucleo/api.js';
import { el, icono, enlace } from '../nucleo/dom.js';
import { fechaLarga } from '../nucleo/formato.js';

iniciarMarco();

let productos = [];
let seleccion = 'radar';

function pintarCatalogo() {
  const cont = document.getElementById('productos');
  cont.textContent = '';
  for (const p of productos) {
    const b = el('button', 'opcion luz tono-' + p.tono);
    b.type = 'button';
    b.id = 'producto-' + p.id;
    b.setAttribute('aria-pressed', String(p.id === seleccion));
    b.dataset.revelar = '';
    const cab = el('span', 'opcion__cab');
    const fl = el('span', 'flecha');
    fl.appendChild(icono('flecha'));
    cab.append(el('span', 'opcion__para', p.para), fl);
    const cuerpo = el('span', 'pila');
    cuerpo.style.gap = '6px';
    cuerpo.append(el('span', 'opcion__nombre', p.nombre), el('span', 'opcion__texto', p.pregunta));
    b.append(cab, cuerpo, el('span', 'opcion__precio', p.precio));
    b.addEventListener('click', () => elegir(p.id, true));
    cont.appendChild(b);
  }
}

function pintarDetalle() {
  const p = productos.find((x) => x.id === seleccion);
  const d = document.getElementById('detalle');
  d.textContent = '';
  const filas = el('div', 'oscuro__filas');
  for (const [k, v, mono] of [['Entregable', p.entregable], ['Precio orientativo', p.detallePrecio, true]]) {
    const f = el('div', 'oscuro__fila');
    const valor = el('span', mono ? 'mono' : null, v);
    f.append(el('span', null, k), valor);
    filas.appendChild(f);
  }
  const enlaces = el('div', 'pila');
  enlaces.style.gap = '10px';
  const verEntregable = enlace(p.enlaceEntregable, 'enlace-claro', 'Ver el entregable: ' + p.entregable.toLowerCase());
  enlaces.appendChild(verEntregable);
  if (p.ejemplo) enlaces.appendChild(enlace(p.ejemplo, 'enlace-claro', 'Ver el ejemplo de la Fiesta del Vino'));

  const pedir = enlace('#contacto', 'boton-claro', 'Pedir diagnóstico gratuito');
  pedir.addEventListener('click', () => { document.getElementById('contacto-servicio').value = p.id; });

  const detalle = el('p', 'oscuro__suave', p.incluye);
  detalle.style.fontSize = '15px';
  detalle.style.lineHeight = '23px';
  const pregunta = el('span', null, p.pregunta);
  pregunta.style.cssText = 'font-size:18px;line-height:26px;font-weight:500;color:#EAF3F4';
  d.append(el('span', 'oscuro__etiqueta', p.para), el('h2', 'oscuro__grande', p.nombre), pregunta, detalle, filas, enlaces, pedir);
}

function elegir(id, desdeClic) {
  if (!productos.some((p) => p.id === id)) return;
  seleccion = id;
  document.querySelectorAll('#productos .opcion').forEach((b) => b.setAttribute('aria-pressed', String(b.id === 'producto-' + id)));
  pintarDetalle();
  if (desdeClic) history.replaceState(null, '', '#' + id);
  if (desdeClic && window.matchMedia('(max-width: 900px)').matches) {
    document.getElementById('detalle').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function pintarPaquete(paq) {
  document.getElementById('t-paq').textContent = paq.titulo;
  document.getElementById('paquete-desc').textContent = paq.descripcion;
  document.getElementById('paquete-precio').textContent = paq.precio;
  const ol = document.getElementById('paquete-pasos');
  for (const s of paq.pasos) {
    const li = el('li');
    const a = enlace(s.enlace, 'paso' + (s.destacado ? ' paso--destacado' : ''));
    const ver = el('span', 'paso__ver', 'Ver entregable');
    ver.appendChild(icono('flecha', 'ico ico--s'));
    a.append(el('span', 'paso__cuando', s.cuando), el('span', 'paso__que', s.que), ver);
    li.appendChild(a);
    ol.appendChild(li);
  }
}

// ---------- Agenda ----------
function pintarAgenda(ag) {
  document.getElementById('agenda-etiqueta').textContent = ag.etiqueta;
  document.getElementById('t-ag').textContent = ag.titulo;
  document.getElementById('agenda-texto').textContent = ag.texto;
  const form = document.getElementById('form-agenda');
  form.addEventListener('submit', (e) => { e.preventDefault(); comprobar(); });
}

const TEXTO_RIESGO = {
  bajo: 'Riesgo bajo: buena fecha',
  medio: 'Riesgo medio: hay alternativas mejores',
  alto: 'Riesgo alto: mejor evitarla'
};

async function comprobar() {
  const entrada = document.getElementById('fecha-agenda');
  const error = document.getElementById('error-fecha-agenda');
  const salida = document.getElementById('agenda-resultado');
  error.textContent = '';
  entrada.removeAttribute('aria-invalid');
  if (!entrada.value) {
    error.textContent = 'Elige una fecha para comprobarla.';
    entrada.setAttribute('aria-invalid', 'true');
    entrada.focus();
    return;
  }
  let r;
  try { r = await comprobarFecha(entrada.value); } catch (e) {
    error.textContent = e.message;
    return;
  }
  salida.textContent = '';

  const v = el('div', 'veredicto');
  v.append(el('span', 'veredicto__fecha', fechaLarga(r.fecha)), el('span', 'riesgo riesgo--' + r.riesgo, TEXTO_RIESGO[r.riesgo]));
  const lista = el('ul', 'lista-simple');
  const fila = (ic, texto) => { const li = el('li'); li.append(icono(ic), el('span', null, texto)); lista.appendChild(li); };
  fila('alerta', 'Probabilidad de lluvia: ' + r.lluvia + ' %');
  fila('calendario', r.festivos.length ? 'Festivos cerca: ' + r.festivos.map((f) => f.nombre).join(', ') : 'Sin festivos cerca');
  fila('usuarios', r.eventos.length === 1 ? '1 evento el mismo fin de semana' : r.eventos.length + ' eventos el mismo fin de semana');
  v.appendChild(lista);

  const ev = el('div', 'veredicto');
  ev.appendChild(el('span', 'mini__nombre', 'Eventos que compiten'));
  if (r.eventos.length) {
    const ul = el('ul', 'lista-simple');
    r.eventos.forEach((x) => {
      const li = el('li');
      li.append(icono('lugar'), el('span', null, x.nombre + ' · ' + x.municipio + (x.registrado ? ' (registrado en la Agenda)' : '')));
      ul.appendChild(li);
    });
    ev.appendChild(ul);
  } else {
    ev.appendChild(el('p', 'texto-suave', 'Ningún evento registrado ese fin de semana.'));
  }

  // Registro del evento propio
  const reg = el('form', 'veredicto');
  reg.noValidate = true;
  reg.appendChild(el('span', 'mini__nombre', 'Registra tu evento en esta fecha'));
  const nombre = el('input', 'entrada');
  nombre.name = 'nombre';
  nombre.placeholder = 'Nombre del evento';
  nombre.setAttribute('aria-label', 'Nombre del evento');
  const municipio = el('input', 'entrada');
  municipio.name = 'municipio';
  municipio.placeholder = 'Municipio';
  municipio.setAttribute('aria-label', 'Municipio');
  const enviar = el('button', 'boton boton--claro', 'Registrar');
  enviar.type = 'submit';
  const estado = el('p', 'mensaje');
  estado.setAttribute('role', 'status');
  reg.append(nombre, municipio, enviar, estado);
  reg.addEventListener('submit', async (e) => {
    e.preventDefault();
    enviar.disabled = true;
    const res = await registrarEvento({ nombre: nombre.value, municipio: municipio.value, fecha: r.fecha }).catch(() => ({ ok: false }));
    enviar.disabled = false;
    estado.classList.toggle('mensaje--error', !res.ok);
    if (res.ok) {
      estado.textContent = 'Registrado. Los demás organizadores lo verán al comprobar esta fecha' + (res.local ? ' en este navegador.' : '.');
      setTimeout(comprobar, 1200);
    } else {
      const errores = res.errores || {};
      estado.textContent = Object.values(errores).join(' ') || res.error || 'No se ha podido registrar.';
      nombre.setAttribute('aria-invalid', String(Boolean(errores.nombre)));
      municipio.setAttribute('aria-invalid', String(Boolean(errores.municipio)));
    }
  });
  salida.append(v, ev, reg);
}

// ---------- Contacto ----------
function pintarContacto() {
  const select = document.getElementById('contacto-servicio');
  for (const p of productos) {
    const o = el('option', null, p.nombre);
    o.value = p.id;
    select.appendChild(o);
  }
  const paq = el('option', null, 'Paquete Fiesta');
  paq.value = 'paquete';
  select.appendChild(paq);

  const form = document.getElementById('form-contacto');
  const mensaje = document.getElementById('contacto-mensaje');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = form.querySelector('button[type="submit"]');
    const datosForm = Object.fromEntries(new FormData(form));
    form.querySelectorAll('.error').forEach((n) => { n.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach((n) => n.removeAttribute('aria-invalid'));
    mensaje.textContent = '';
    boton.disabled = true;
    const r = await enviarContacto(datosForm).catch(() => ({ ok: false, error: 'No hay conexión. Prueba otra vez.' }));
    boton.disabled = false;
    if (r.ok) {
      mensaje.classList.remove('mensaje--error');
      mensaje.textContent = r.mensaje;
      form.reset();
      return;
    }
    mensaje.classList.add('mensaje--error');
    const errores = r.errores || {};
    let primero = null;
    for (const [campo, texto] of Object.entries(errores)) {
      const entrada = form.elements[campo];
      const hueco = document.getElementById('e-' + campo);
      if (hueco) hueco.textContent = texto;
      if (entrada) { entrada.setAttribute('aria-invalid', 'true'); primero = primero || entrada; }
    }
    mensaje.textContent = r.error || 'Revisa los campos marcados.';
    primero?.focus();
  });
}

Promise.all([datos('productos')])
  .then(([d]) => {
    productos = d.productos;
    const hash = location.hash.slice(1);
    if (productos.some((p) => p.id === hash)) seleccion = hash;
    pintarCatalogo();
    pintarDetalle();
    pintarPaquete(d.paquete);
    pintarAgenda(d.agenda);
    pintarContacto();
    if (productos.some((p) => p.id === hash)) document.getElementById('catalogo').scrollIntoView();
    window.addEventListener('hashchange', () => elegir(location.hash.slice(1), false));
    listo();
  })
  .catch(mostrarError);
