// Añade ?v=<versión> a los JS y CSS propios de la carpeta publicada.
// Así, tras cada despliegue el navegador descarga los archivos nuevos en vez de
// mezclar módulos en caché del despliegue anterior (p. ej. un marco.js viejo
// sin una función que un módulo nuevo importa).
// Uso: node servidor/versionar.js <carpeta> <versión>
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const [carpeta, version] = process.argv.slice(2);
if (!carpeta || !version) {
  console.error('Uso: node servidor/versionar.js <carpeta> <versión>');
  process.exit(1);
}
const v = '?v=' + encodeURIComponent(version);

// import … from './x.js' · import './x.js'
const IMPORTS = /((?:\bfrom|\bimport)\s*)(['"])(\.{1,2}\/[^'"?#]+\.js)\2/g;
// src="js/x.js" · href="css/x.css" (solo rutas propias, no externas)
const ENLACES = /(\b(?:src|href)=")(?!https?:|\/\/|data:)([^"?#]+\.(?:js|css))"/g;

let archivos = 0;
function recorrer(dir) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) { recorrer(ruta); continue; }
    const tipo = extname(nombre);
    if (tipo !== '.js' && tipo !== '.html') continue;
    const antes = readFileSync(ruta, 'utf8');
    const despues = tipo === '.js'
      ? antes.replace(IMPORTS, (_, a, c, r) => a + c + r + v + c)
      : antes.replace(ENLACES, (_, a, r) => a + r + v + '"');
    if (despues !== antes) { writeFileSync(ruta, despues); archivos++; }
  }
}
recorrer(carpeta);
console.log(`Versión ${version} aplicada en ${archivos} archivos.`);
