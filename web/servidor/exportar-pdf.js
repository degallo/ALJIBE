// Genera el PDF de la exposición (10 páginas de 1920 × 1080) a partir de
// presentacion.html, para entregarlo al profesor.
// Uso, con el servidor en marcha (npm start):
//   node servidor/exportar-pdf.js [url] [salida]
// Necesita Playwright con Chromium (npx playwright install chromium).
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const aqui = dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:8080/presentacion.html';
const salida = process.argv[3] || join(aqui, '..', 'descargas', 'aljibe-presentacion-granada-2031.pdf');

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 } });
await pagina.goto(url + (url.includes('?') ? '&' : '?') + 'imprimir', { waitUntil: 'networkidle' });
await pagina.evaluate(() => document.fonts.ready);
const diapositivas = await pagina.locator('.diapo').count();
await pagina.emulateMedia({ media: 'print' });
await pagina.pdf({ path: salida, width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
await navegador.close();
console.log(`PDF con ${diapositivas} diapositivas guardado en ${salida}`);
