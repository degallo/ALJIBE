// Acceso a los datos y al servidor. Si no hay servidor (web alojada como
// páginas estáticas), se calcula en el navegador y se guarda en este equipo.
import { raiz } from './dom.js';
import { comprobarFecha as comprobarLocal, validarEvento, validarContacto } from './calculos.js';

const cache = new Map();
let estado = null;

export function datos(nombre) {
  if (!cache.has(nombre)) {
    cache.set(nombre, fetch(raiz() + 'datos/' + nombre + '.json').then((r) => {
      if (!r.ok) throw new Error('No se han podido cargar los datos (' + nombre + ').');
      return r.json();
    }));
  }
  return cache.get(nombre);
}

// ¿Hay servidor? Se pregunta una vez por página
export function servidor() {
  if (!estado) {
    const control = new AbortController();
    const espera = setTimeout(() => control.abort(), 1500);
    estado = fetch(raiz() + 'api/estado', { signal: control.signal, cache: 'no-store' })
      .then((r) => (r.ok && /json/.test(r.headers.get('content-type') || '') ? r.json() : null))
      .then((j) => Boolean(j && j.ok && j.servidor === 'ALJIBE'))
      .catch(() => false)
      .finally(() => clearTimeout(espera));
  }
  return estado;
}

async function pedir(ruta, opciones) {
  const r = await fetch(raiz() + 'api/' + ruta, opciones);
  const cuerpo = await r.json().catch(() => ({}));
  return { estado: r.status, ...cuerpo };
}

function enviarJSON(ruta, datosEnvio) {
  return pedir(ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datosEnvio) });
}

// Almacén local para cuando no hay servidor
function leerLocal(clave) {
  try { return JSON.parse(localStorage.getItem(clave) || '[]'); } catch { return []; }
}
function guardarLocal(clave, lista) {
  try { localStorage.setItem(clave, JSON.stringify(lista)); return true; } catch { return false; }
}

export async function comprobarFecha(iso) {
  if (await servidor()) {
    const r = await pedir('agenda/comprobar?fecha=' + encodeURIComponent(iso));
    if (!r.ok) throw new Error(r.error || 'No se ha podido comprobar la fecha.');
    return r;
  }
  return comprobarLocal(iso, await datos('agenda'), leerLocal('aljibe-agenda'));
}

export async function registrarEvento(evento) {
  if (await servidor()) return enviarJSON('agenda/eventos', evento);
  const v = validarEvento(evento);
  if (!v.valido) return { ok: false, estado: 422, errores: v.errores };
  const lista = leerLocal('aljibe-agenda');
  lista.push({ ...v.evento, id: Date.now().toString(36), local: true });
  guardarLocal('aljibe-agenda', lista);
  return { ok: true, estado: 201, evento: v.evento, local: true };
}

export async function enviarContacto(contacto) {
  if (await servidor()) return enviarJSON('contacto', contacto);
  const v = validarContacto(contacto);
  if (!v.valido) return { ok: false, estado: 422, errores: v.errores };
  const lista = leerLocal('aljibe-contactos');
  lista.push({ ...v.contacto, recibido: new Date().toISOString() });
  guardarLocal('aljibe-contactos', lista);
  return { ok: true, estado: 201, local: true, mensaje: 'Recibido. Te escribimos en menos de 48 horas para fijar el diagnóstico.' };
}
