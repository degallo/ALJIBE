// Formato español: punto de miles, coma decimal y espacio antes de € y %.
// Se usa igual en el navegador y en el servidor.

const MENOS = '−'; // signo menos tipográfico (−)

export function numero(valor, decimales = 0) {
  const fijo = Math.abs(valor).toFixed(decimales);
  const [entera, frac] = fijo.split('.');
  const conMiles = entera.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const signo = valor < 0 && Number(fijo) !== 0 ? MENOS : '';
  return signo + conMiles + (frac ? ',' + frac : '');
}

export function euros(valor, decimales = 0) {
  return numero(valor, decimales) + ' €';
}

export function porcentaje(valor, decimales = 0) {
  return numero(valor, decimales) + ' %';
}

// Cifra con su unidad según el tipo de indicador
export function conUnidad(valor, tipo, decimales = 0) {
  if (tipo === 'euros') return euros(valor, decimales);
  if (tipo === 'pct') return porcentaje(valor, decimales);
  return numero(valor, decimales);
}

// Diferencias: los porcentajes se expresan en puntos (pp)
export function diferencia(valor, tipo, decimales = 0) {
  if (tipo === 'pct') return numero(valor, decimales) + ' pp';
  return conUnidad(valor, tipo, decimales);
}

export function conSigno(valor, tipo, decimales = 0) {
  if (valor === 0) return '0';
  const texto = diferencia(Math.abs(valor), tipo, decimales);
  return (valor > 0 ? '+' : MENOS) + texto;
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
  'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Las fechas ISO (AAAA-MM-DD) se tratan en UTC para que no cambie el día por la zona horaria
export function leerFecha(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

export function fechaLarga(iso, conAnio = true) {
  const f = leerFecha(iso);
  const dia = DIAS[f.getUTCDay()];
  const texto = dia.charAt(0).toUpperCase() + dia.slice(1) + ' ' + f.getUTCDate() + ' de ' + MESES[f.getUTCMonth()];
  return conAnio ? texto + ' de ' + f.getUTCFullYear() : texto;
}

export function nombreDia(iso) {
  return DIAS[leerFecha(iso).getUTCDay()];
}

export function nombreMes(indice) {
  return MESES[indice];
}
