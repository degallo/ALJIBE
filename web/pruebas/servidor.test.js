import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { get } from 'node:http';
import { crearServidor } from '../servidor/servidor.js';

let servidor, base, almacen;

before(async () => {
  almacen = await mkdtemp(path.join(tmpdir(), 'aljibe-'));
  servidor = crearServidor({ almacen });
  await new Promise((r) => servidor.listen(0, r));
  base = 'http://localhost:' + servidor.address().port;
});

after(async () => {
  servidor.close();
  await rm(almacen, { recursive: true, force: true });
});

const json = (ruta, opciones) => fetch(base + ruta, opciones).then(async (r) => ({ estado: r.status, cuerpo: await r.json() }));
const enviar = (ruta, datos) => json(ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });

test('sirve la web y protege lo privado', async () => {
  const inicio = await fetch(base + '/');
  assert.equal(inicio.status, 200);
  assert.match(inicio.headers.get('content-type'), /text\/html/);
  assert.equal((await fetch(base + '/servidor/servidor.js')).status, 404);
  assert.equal((await fetch(base + '/package.json')).status, 404);
  // Petición sin normalizar: intenta salir de la carpeta web/
  const crudo = (ruta) => new Promise((ok) => get({ host: 'localhost', port: servidor.address().port, path: ruta }, (r) => {
    let cuerpo = '';
    r.on('data', (t) => { cuerpo += t; });
    r.on('end', () => ok({ estado: r.statusCode, cuerpo }));
  }));
  // /../README.md se queda dentro de web/: nunca sirve el README de la raíz del repositorio
  const readme = await crudo('/../README.md');
  assert.ok(readme.estado === 404 || readme.cuerpo.startsWith('# Web del prototipo'));
  assert.equal((await crudo('/../package.json')).estado, 404);
  assert.equal((await crudo('/%2e%2e/%2e%2e/etc/passwd')).estado, 404);
  assert.equal((await crudo('/servidor/almacen/contactos.json')).estado, 404);
});

test('estado y datos', async () => {
  const { cuerpo } = await json('/api/estado');
  assert.equal(cuerpo.ok, true);
  // La web sondea api/estado.json: con servidor responde la API, sin servidor el archivo estático
  assert.equal((await json('/api/estado.json')).cuerpo.servidor, 'ALJIBE');
  const datos = await json('/api/datos/fiesta-2027');
  assert.equal(datos.cuerpo.prevision.central, 7600);
  assert.equal((await json('/api/datos/no-existe')).estado, 404);
});

test('decisiones: calcula en el servidor', async () => {
  const { cuerpo } = await enviar('/api/decisiones/fiesta', { activas: ['fecha', 'campana', 'vasos', 'bus', 'tapas'] });
  assert.equal(cuerpo.retorno, 13.4);
  assert.equal(cuerpo.inversion, 3000);
});

test('agenda: comprobar, registrar y volver a comprobar', async () => {
  const antes = await json('/api/agenda/comprobar?fecha=2027-02-20');
  assert.equal(antes.cuerpo.eventos.length, 1);
  const malo = await enviar('/api/agenda/eventos', { nombre: 'x', municipio: '', fecha: 'mañana' });
  assert.equal(malo.estado, 422);
  assert.ok(malo.cuerpo.errores.nombre && malo.cuerpo.errores.fecha);
  const alta = await enviar('/api/agenda/eventos', { nombre: 'Concierto de prueba', municipio: 'Alhama de Granada', fecha: '2027-02-20' });
  assert.equal(alta.estado, 201);
  const despues = await json('/api/agenda/comprobar?fecha=2027-02-20');
  assert.equal(despues.cuerpo.eventos.length, 2);
  assert.equal((await json('/api/agenda/comprobar?fecha=hoy')).estado, 400);
});

test('contacto: valida y guarda', async () => {
  assert.equal((await enviar('/api/contacto', { nombre: 'Ana', email: 'no' })).estado, 422);
  const ok = await enviar('/api/contacto', { nombre: 'Ana', organizacion: 'Ayuntamiento', email: 'ana@ejemplo.es', mensaje: 'Hola' });
  assert.equal(ok.estado, 201);
  const texto = await fetch(base + '/api/contacto', { method: 'POST', body: 'hola' });
  assert.equal(texto.status, 415);
});
