import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calcularCaso, comprobarFecha, puntuarArtistas, simularConcierto, conteoA, validarContacto } from '../js/nucleo/calculos.js';
import { numero, euros, porcentaje, conSigno, fechaLarga } from '../js/nucleo/formato.js';

const leer = (n) => JSON.parse(readFileSync(new URL('../datos/' + n + '.json', import.meta.url)));
const { casos } = leer('decisiones');
const todas = (caso) => caso.decisiones.map((d) => d.id);
const kpi = (r, id) => r.kpis.find((k) => k.id === id);

test('formato español', () => {
  assert.equal(numero(7600), '7.600');
  assert.equal(numero(155000), '155.000');
  assert.equal(numero(4.7, 1), '4,7');
  assert.equal(euros(3000), '3.000 €');
  assert.equal(porcentaje(46), '46 %');
  assert.equal(conSigno(-0.6, 'euros', 1), '−0,6 €');
  assert.equal(conSigno(5, 'pct'), '+5 pp');
  assert.equal(fechaLarga('2027-02-20'), 'Sábado 20 de febrero de 2027');
});

test('caso Fiesta del Vino: cifras de la especificación', () => {
  const r = calcularCaso(casos[0], todas(casos[0]));
  assert.equal(kpi(r, 'asistentes').previsto, 8200);
  assert.equal(kpi(r, 'fuera').previsto, 46);
  assert.equal(kpi(r, 'ingresos').previsto, 20700);
  assert.equal(kpi(r, 'gasto').previsto, 155000);
  assert.equal(r.alcanzados, 4);
  assert.equal(r.inversion, 3000);
  assert.equal(r.retorno, 13.4);
});

test('caso Festival: el coste de captación no llega al objetivo', () => {
  const r = calcularCaso(casos[1], todas(casos[1]));
  assert.equal(kpi(r, 'abonos').previsto, 5150);
  assert.equal(kpi(r, 'fuera').previsto, 37);
  assert.equal(kpi(r, 'patrocinio').previsto, 25500);
  assert.equal(kpi(r, 'captacion').previsto, 4.7);
  assert.equal(kpi(r, 'captacion').alcanzado, false);
  assert.equal(kpi(r, 'captacion').faltan, 0.2);
  assert.equal(r.inversion, 2600);
  assert.equal(r.retorno, 17.5);
});

test('caso Sala: dos objetivos se quedan cortos', () => {
  const r = calcularCaso(casos[2], todas(casos[2]));
  assert.equal(kpi(r, 'ocupacion').previsto, 73);
  assert.equal(kpi(r, 'ocupacion').faltan, 2);
  assert.equal(kpi(r, 'repite').previsto, 28);
  assert.equal(kpi(r, 'ingreso').previsto, 4300);
  assert.equal(kpi(r, 'perdidas').previsto, 3);
  assert.equal(kpi(r, 'perdidas').alcanzado, true);
  assert.equal(r.inversion, 3100);
  assert.equal(r.retorno, 11.6);
});

test('sin decisiones activas no hay retorno y se queda el valor de hoy', () => {
  const r = calcularCaso(casos[0], []);
  assert.equal(r.retorno, null);
  assert.equal(kpi(r, 'asistentes').previsto, 7100);
  assert.equal(r.inversion, 0);
});

test('solo decisiones sin coste: inversión 0 y sin retorno calculable', () => {
  const r = calcularCaso(casos[0], ['fecha']);
  assert.equal(r.inversion, 0);
  assert.equal(r.retorno, null);
});

test('agenda: los cuatro sábados de febrero coinciden con el cuadro de mando', () => {
  const agenda = leer('agenda');
  const fiesta = leer('fiesta-2027');
  const esperado = { '2027-02-06': 'alto', '2027-02-13': 'medio', '2027-02-20': 'bajo', '2027-02-27': 'alto' };
  for (const f of fiesta.fechas) {
    const r = comprobarFecha(f.iso, agenda);
    assert.equal(r.eventos.length + ' evento' + (r.eventos.length > 1 ? 's' : ''), f.comp, f.iso);
    assert.equal(r.lluvia + ' %', f.lluvia, f.iso);
    assert.equal(r.riesgo, esperado[f.iso], f.iso);
  }
});

test('agenda: los eventos registrados cuentan y las fechas malas se rechazan', () => {
  const agenda = leer('agenda');
  const r = comprobarFecha('2027-02-20', agenda, [{ nombre: 'Prueba', municipio: 'Alhama', fecha: '2027-02-20' }]);
  assert.equal(r.eventos.length, 2);
  assert.throws(() => comprobarFecha('20/02/2027', agenda));
});

test('programación: con los pesos por defecto gana la opción A', () => {
  const p = leer('programacion');
  const pesos = Object.fromEntries(p.criterios.map((c) => [c.id, c.peso]));
  const r = puntuarArtistas(p.artistas, pesos);
  assert.equal(r[0].id, 'a');
  assert.equal(r[0].puntos, 81);
  const local = puntuarArtistas(p.artistas, { afinidad: 20, local: 70, traccion: 10 });
  assert.equal(local[0].id, 'd');
});

test('simulador: pasar del martes al jueves sube la ocupación', () => {
  const { modelo } = leer('sala');
  const base = { genero: 'jazz', precio: 11, cache: 1200, promocion: false, bono: false };
  const martes = simularConcierto(modelo, { ...base, dia: 'martes' });
  const jueves = simularConcierto(modelo, { ...base, dia: 'jueves' });
  assert.ok(jueves.ocupacion > martes.ocupacion);
  assert.ok(jueves.ocupacion <= 100);
});

test('conteo: al cierre han entrado los 7.600 previstos y no faltan vasos', () => {
  const dia = leer('conteo');
  const fin = conteoA(dia.cierre, dia);
  assert.equal(fin.llegadas, 7600);
  assert.ok(fin.vasosQuedan >= 0);
  const pico = Math.max(...Array.from({ length: 41 }, (_, i) => conteoA(12 + i / 4, dia).dentro));
  assert.ok(pico <= dia.aforo, 'el pico no supera el aforo');
});

test('contacto: valida el correo', () => {
  assert.equal(validarContacto({ nombre: 'Ana', email: 'ana@alhama.es' }).valido, true);
  assert.equal(validarContacto({ nombre: 'Ana', email: 'ana' }).valido, false);
});
