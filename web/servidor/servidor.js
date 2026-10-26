// Servidor del prototipo de ALJIBE. Node 18 o superior, sin dependencias.
//   node servidor/servidor.js        → http://localhost:8080
// Sirve la web estática y una API pequeña para la Agenda, el contacto y los cálculos.
// Si la web se abre sin servidor (por ejemplo, alojada como página estática),
// las pantallas usan los mismos cálculos en el navegador.

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { calcularCaso, comprobarFecha, validarEvento, validarContacto } from '../js/nucleo/calculos.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const DATOS = path.join(RAIZ, 'datos');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// Carpetas y archivos que no se publican (código del servidor, pruebas y lo que guarda la API)
const PRIVADO = /^\/(servidor|pruebas|node_modules)(\/|$)|^\/package(-lock)?\.json$|\/\./;

const CABECERAS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'self'"
  ].join('; ')
};

const LIMITE_CUERPO = 10 * 1024;

export function crearServidor({ almacen = path.join(AQUI, 'almacen') } = {}) {
  const archivoAgenda = path.join(almacen, 'agenda.json');
  const archivoContactos = path.join(almacen, 'contactos.json');
  const escrituras = new Map(); // límite sencillo de envíos por IP

  async function leerLista(archivo) {
    try { return JSON.parse(await readFile(archivo, 'utf8')); } catch { return []; }
  }
  async function guardarLista(archivo, lista) {
    await mkdir(almacen, { recursive: true });
    await writeFile(archivo, JSON.stringify(lista, null, 2));
  }
  async function leerDatos(nombre) {
    return JSON.parse(await readFile(path.join(DATOS, nombre + '.json'), 'utf8'));
  }

  function responder(res, estado, cuerpo) {
    res.writeHead(estado, { ...CABECERAS, 'Content-Type': TIPOS['.json'], 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(cuerpo));
  }

  function demasiados(req) {
    const ip = req.socket.remoteAddress || 'local';
    const ahora = Date.now();
    const lista = (escrituras.get(ip) || []).filter((t) => ahora - t < 60000);
    lista.push(ahora);
    escrituras.set(ip, lista);
    return lista.length > 20;
  }

  function leerCuerpo(req) {
    return new Promise((resolve, reject) => {
      if (!/application\/json/.test(req.headers['content-type'] || '')) {
        reject(Object.assign(new Error('Envía los datos en JSON.'), { estado: 415 }));
        return;
      }
      let tam = 0;
      const trozos = [];
      req.on('data', (t) => {
        tam += t.length;
        if (tam > LIMITE_CUERPO) {
          reject(Object.assign(new Error('Los datos son demasiado grandes.'), { estado: 413 }));
          req.destroy();
          return;
        }
        trozos.push(t);
      });
      req.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(trozos).toString('utf8') || '{}')); }
        catch { reject(Object.assign(new Error('JSON no válido.'), { estado: 400 })); }
      });
      req.on('error', reject);
    });
  }

  async function api(req, res, url) {
    const ruta = url.pathname.replace(/\/+$/, '');
    const metodo = req.method;

    if (ruta === '/api/estado' && metodo === 'GET') {
      const registrados = await leerLista(archivoAgenda);
      return responder(res, 200, { ok: true, servidor: 'ALJIBE', version: 1, eventosRegistrados: registrados.length });
    }

    let m = ruta.match(/^\/api\/datos\/([a-z0-9-]+)$/);
    if (m && metodo === 'GET') {
      try { return responder(res, 200, await leerDatos(m[1])); }
      catch { return responder(res, 404, { ok: false, error: 'No existe ese conjunto de datos.' }); }
    }

    m = ruta.match(/^\/api\/decisiones\/([a-z0-9-]+)$/);
    if (m && metodo === 'POST') {
      const cuerpo = await leerCuerpo(req);
      const { casos } = await leerDatos('decisiones');
      const caso = casos.find((c) => c.id === m[1]);
      if (!caso) return responder(res, 404, { ok: false, error: 'No existe ese caso.' });
      const activas = Array.isArray(cuerpo.activas) ? cuerpo.activas.filter((x) => typeof x === 'string') : caso.decisiones.map((d) => d.id);
      return responder(res, 200, { ok: true, ...calcularCaso(caso, activas) });
    }

    if (ruta === '/api/agenda/comprobar' && metodo === 'GET') {
      const fecha = url.searchParams.get('fecha') || '';
      try {
        const resultado = comprobarFecha(fecha, await leerDatos('agenda'), await leerLista(archivoAgenda));
        return responder(res, 200, { ok: true, ...resultado });
      } catch {
        return responder(res, 400, { ok: false, error: 'Elige una fecha válida.' });
      }
    }

    if (ruta === '/api/agenda/eventos' && metodo === 'GET') {
      return responder(res, 200, { ok: true, eventos: await leerLista(archivoAgenda) });
    }

    if (ruta === '/api/agenda/eventos' && metodo === 'POST') {
      if (demasiados(req)) return responder(res, 429, { ok: false, error: 'Demasiados envíos seguidos. Prueba en un minuto.' });
      const { valido, errores, evento } = validarEvento(await leerCuerpo(req));
      if (!valido) return responder(res, 422, { ok: false, errores });
      const lista = await leerLista(archivoAgenda);
      const nuevo = { ...evento, id: Date.now().toString(36), creado: new Date().toISOString() };
      lista.push(nuevo);
      await guardarLista(archivoAgenda, lista.slice(-500));
      return responder(res, 201, { ok: true, evento: nuevo });
    }

    if (ruta === '/api/contacto' && metodo === 'POST') {
      if (demasiados(req)) return responder(res, 429, { ok: false, error: 'Demasiados envíos seguidos. Prueba en un minuto.' });
      const { valido, errores, contacto } = validarContacto(await leerCuerpo(req));
      if (!valido) return responder(res, 422, { ok: false, errores });
      const lista = await leerLista(archivoContactos);
      lista.push({ ...contacto, recibido: new Date().toISOString() });
      await guardarLista(archivoContactos, lista.slice(-1000));
      return responder(res, 201, { ok: true, mensaje: 'Recibido. Te escribimos en menos de 48 horas para fijar el diagnóstico.' });
    }

    return responder(res, 404, { ok: false, error: 'Ruta no encontrada.' });
  }

  async function estatico(req, res, url) {
    let ruta;
    try { ruta = decodeURIComponent(url.pathname); } catch { ruta = '/'; }
    if (ruta.endsWith('/')) ruta += 'index.html';
    if (PRIVADO.test(ruta)) return noEncontrado(res);
    const archivo = path.resolve(RAIZ, '.' + ruta);
    if (!archivo.startsWith(RAIZ + path.sep)) return noEncontrado(res);
    try {
      const info = await stat(archivo);
      if (!info.isFile()) return noEncontrado(res);
      const tipo = TIPOS[path.extname(archivo)] || 'application/octet-stream';
      res.writeHead(200, { ...CABECERAS, 'Content-Type': tipo, 'Cache-Control': 'no-cache' });
      if (req.method === 'HEAD') return res.end();
      res.end(await readFile(archivo));
    } catch {
      noEncontrado(res);
    }
  }

  function noEncontrado(res) {
    res.writeHead(404, { ...CABECERAS, 'Content-Type': TIPOS['.txt'] });
    res.end('No encontrado');
  }

  return createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname.startsWith('/api/')) await api(req, res, url);
      else if (req.method === 'GET' || req.method === 'HEAD') await estatico(req, res, url);
      else responder(res, 405, { ok: false, error: 'Método no permitido.' });
    } catch (e) {
      if (!res.headersSent) responder(res, e.estado || 500, { ok: false, error: e.estado ? e.message : 'Error del servidor.' });
      if (!e.estado) console.error(e);
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const puerto = Number(process.env.PORT) || 8080;
  crearServidor().listen(puerto, () => {
    console.log('ALJIBE en http://localhost:' + puerto);
  });
}
