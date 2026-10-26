// Cálculos del prototipo. Los usan las pantallas y el servidor, así las cifras
// son siempre las mismas se vea la web con o sin servidor.

import { leerFecha } from './formato.js';

function redondear(valor, decimales) {
  const f = 10 ** decimales;
  return Math.round(valor * f) / f;
}

// ---------- Panel de decisiones ----------
// activas: lista o Set con los id de las decisiones activadas
export function calcularCaso(caso, activas) {
  const on = new Set(activas);
  const elegidas = caso.decisiones.filter((d) => on.has(d.id));

  const kpis = caso.kpis.map((k) => {
    const suma = elegidas.reduce((t, d) => t + (d.efectos[k.id] || 0), 0);
    const previsto = redondear(k.hoy + suma, k.decimales);
    const mas = k.sentido === 'mas';
    const alcanzado = mas ? previsto >= k.objetivo : previsto <= k.objetivo;
    const bruto = mas ? previsto / k.objetivo : k.objetivo / previsto;
    const progreso = Math.max(0, Math.min(1, previsto > 0 ? bruto : 1));
    const faltan = alcanzado ? 0 : redondear(Math.abs(k.objetivo - previsto), k.decimales);
    return { ...k, previsto, alcanzado, progreso, faltan };
  });

  const inversion = elegidas.reduce((t, d) => t + d.coste, 0);
  const valor = elegidas.reduce((t, d) => t + d.valor, 0);
  const retorno = inversion > 0 ? redondear(valor / inversion, 1) : null;
  const alcanzados = kpis.filter((k) => k.alcanzado).length;

  return { caso: caso.id, activas: elegidas.map((d) => d.id), kpis, inversion, valor, retorno, alcanzados };
}

// ---------- Agenda ALJIBE ----------
const DIA_MS = 86400000;

function distanciaDias(a, b) {
  return Math.round((leerFecha(a) - leerFecha(b)) / DIA_MS);
}

// Eventos del mismo fin de semana (±1 día) y festivos cercanos (±1 día)
export function comprobarFecha(iso, agenda, registrados = []) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || Number.isNaN(leerFecha(iso).getTime())) {
    throw new Error('Fecha no válida');
  }
  const todos = agenda.eventos.concat(registrados.map((e) => ({ ...e, registrado: true })));
  const eventos = todos.filter((e) => Math.abs(distanciaDias(e.fecha, iso)) <= 1);
  const festivos = agenda.festivos.filter((f) => Math.abs(distanciaDias(f.fecha, iso)) <= 1);

  const semanal = agenda.clima.semanas.find((s) => s.fecha === iso);
  const mes = leerFecha(iso).getUTCMonth();
  const lluvia = semanal ? semanal.lluvia : agenda.clima.meses[mes];

  const fuerte = festivos.some((f) => f.peso === 'alto');
  let riesgo = 'bajo';
  if (eventos.length >= 4 || lluvia >= 30 || fuerte) riesgo = 'alto';
  else if (eventos.length >= 2 || lluvia >= 25 || festivos.length > 0) riesgo = 'medio';

  return { fecha: iso, eventos, festivos, lluvia, riesgo };
}

export function validarEvento(datos) {
  const errores = {};
  const nombre = typeof datos.nombre === 'string' ? datos.nombre.trim() : '';
  const municipio = typeof datos.municipio === 'string' ? datos.municipio.trim() : '';
  const fecha = typeof datos.fecha === 'string' ? datos.fecha : '';
  if (nombre.length < 3 || nombre.length > 80) errores.nombre = 'Escribe un nombre de entre 3 y 80 caracteres.';
  if (municipio.length < 2 || municipio.length > 60) errores.municipio = 'Escribe el municipio.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(leerFecha(fecha).getTime())) errores.fecha = 'Elige una fecha válida.';
  return { valido: Object.keys(errores).length === 0, errores, evento: { nombre, municipio, fecha } };
}

export function validarContacto(datos) {
  const errores = {};
  const limpio = {};
  for (const campo of ['nombre', 'organizacion', 'email', 'mensaje', 'servicio']) {
    limpio[campo] = typeof datos[campo] === 'string' ? datos[campo].trim() : '';
  }
  if (limpio.nombre.length < 2 || limpio.nombre.length > 80) errores.nombre = 'Escribe tu nombre.';
  if (limpio.organizacion.length > 120) errores.organizacion = 'El nombre de la organización es demasiado largo.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpio.email) || limpio.email.length > 120) errores.email = 'Escribe un correo válido, por ejemplo nombre@ayuntamiento.es.';
  if (limpio.mensaje.length > 1000) errores.mensaje = 'El mensaje no puede pasar de 1.000 caracteres.';
  return { valido: Object.keys(errores).length === 0, errores, contacto: limpio };
}

// ---------- Estudio de programación ----------
// pesos: { afinidad, local, traccion } en cualquier escala; se normalizan
export function puntuarArtistas(artistas, pesos) {
  const total = Object.values(pesos).reduce((t, v) => t + v, 0) || 1;
  return artistas
    .map((a) => {
      const puntos = Math.round(
        (a.afinidad * pesos.afinidad + a.local * pesos.local + a.traccion * pesos.traccion) / total
      );
      return { ...a, puntos };
    })
    .sort((x, y) => y.puntos - x.puntos || x.cache - y.cache);
}

// ---------- Simulador de la sala (suscripción avanzada) ----------
export function simularConcierto(modelo, entrada) {
  const base = modelo.baseDia[entrada.dia] ?? 55;
  const genero = modelo.afinidadGenero[entrada.genero] ?? 0;
  const precio = -modelo.elasticidad * (entrada.precio - modelo.precioReferencia);
  const extra = (entrada.promocion ? modelo.efectoPromocion : 0) + (entrada.bono ? modelo.efectoBono : 0);
  const ocupacion = Math.max(5, Math.min(100, Math.round(base + genero + precio + extra)));
  const publico = Math.round((modelo.aforo * ocupacion) / 100);
  const ingreso = Math.round(publico * (entrada.precio + modelo.gastoBarra));
  const coste = entrada.cache + modelo.costeFijo + (entrada.promocion ? modelo.costePromocion : 0);
  return { ocupacion, publico, ingreso, coste, resultado: ingreso - coste };
}

// ---------- Conteo del día de la fiesta ----------
// Llegadas acumuladas y personas dentro a una hora dada (en horas decimales)
export function conteoA(hora, dia) {
  let llegadas = 0;
  for (const tramo of dia.llegadas) {
    const inicio = tramo.hora;
    if (hora >= inicio + 1) llegadas += tramo.cuota;
    else if (hora > inicio) llegadas += tramo.cuota * (hora - inicio);
  }
  const total = Math.round(dia.total * llegadas);
  // Cada persona se queda de media `estancia` horas
  let salidas = 0;
  const h = hora - dia.estancia;
  for (const tramo of dia.llegadas) {
    if (h >= tramo.hora + 1) salidas += tramo.cuota;
    else if (h > tramo.hora) salidas += tramo.cuota * (h - tramo.hora);
  }
  const dentro = Math.round(dia.total * (llegadas - salidas));
  const vasos = Math.min(dia.vasos, Math.round(total * dia.vasosPorPersona));
  return { llegadas: total, dentro, vasosVendidos: vasos, vasosQuedan: dia.vasos - vasos };
}
