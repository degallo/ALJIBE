// Ayudas pequeñas para construir el DOM sin innerHTML con datos
import { ICONOS } from './iconos.js';

const NS = 'http://www.w3.org/2000/svg';

export function el(tag, clase, texto) {
  const n = document.createElement(tag);
  if (clase) n.className = clase;
  if (texto != null) n.textContent = texto;
  return n;
}

export function icono(nombre, clase = 'ico') {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('class', clase);
  s.innerHTML = ICONOS[nombre] || '';
  return s;
}

export function svg(tag, atributos = {}) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(atributos)) n.setAttribute(k, v);
  return n;
}

// Texto con saltos de línea a partir de una lista
export function lineas(nodo, partes) {
  partes.forEach((t, i) => {
    if (i) nodo.appendChild(document.createElement('br'));
    nodo.appendChild(document.createTextNode(t));
  });
  return nodo;
}

export function enlace(href, clase, texto) {
  const a = el('a', clase, texto);
  a.href = href;
  return a;
}

export function boton(clase, texto) {
  const b = el('button', clase, texto);
  b.type = 'button';
  return b;
}

export const reducirMovimiento = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const raiz = () => document.documentElement.dataset.raiz || '';
