// Pantalla Inicio: pinta las secciones a partir de los JSON de web/datos/
import { iniciarMarco, listo, mostrarError } from '../marco.js';
import { datos } from '../nucleo/api.js';
import { el, icono, lineas, reducirMovimiento } from '../nucleo/dom.js';
import { contar } from '../efectos.js';
import { numero } from '../nucleo/formato.js';

iniciarMarco();
const reducir = reducirMovimiento();

function pintarPrevision(d, fiesta) {
  const f = fiesta.fechaRecomendada;
  d = { ...d, cifra: numero(fiesta.prevision.central), datos: [
    { etiqueta: 'Mejor fecha', valor: 'Sáb. ' + f.dia + ' ' + f.mes + '.' },
    { etiqueta: 'Ediciones', valor: fiesta.historico.ediciones.length + ' analizadas' }
  ] };
  const a = el('a', 'panel');
  a.href = d.href;
  a.setAttribute('aria-label', 'Abrir la previsión de la ' + d.titulo.join(' '));

  const cab = el('div', 'panel__cab');
  const marca = el('span', 'panel__marca');
  const ic = el('span', 'panel__icono');
  ic.appendChild(icono('copa'));
  marca.append(ic, lineas(el('span', 'panel__nombre'), d.titulo));
  const fl = el('span', 'flecha');
  fl.appendChild(icono('flecha'));
  cab.append(marca, fl);

  const cifra = el('div', 'panel__cifra');
  const valor = el('span', 'panel__valor', d.cifra);
  cifra.append(el('span', 'panel__etiqueta', d.etiquetaCifra), valor);

  const barras = el('div', 'panel__barras');
  barras.setAttribute('aria-hidden', 'true');
  d.serie.forEach((h, i) => {
    const b = document.createElement('span');
    b.style.height = h + 'px';
    b.style.setProperty('--i', i);
    barras.appendChild(b);
  });

  const datosPanel = el('div', 'panel__datos');
  d.datos.forEach((x) => {
    const c = el('span', 'panel__dato');
    c.append(el('small', null, x.etiqueta), el('strong', null, x.valor));
    datosPanel.appendChild(c);
  });

  a.append(cab, cifra, barras, datosPanel);
  document.getElementById('prevision').appendChild(a);
  if (!reducir) setTimeout(() => contar(valor, 1400), 500);
}

function pintarDimensiones(d) {
  document.getElementById('t-dim').textContent = d.titulo;
  const cont = document.getElementById('dimensiones');
  d.items.forEach((it) => {
    const t = el('article', 'tarjeta');
    const ic = el('span', 'tarjeta__icono');
    ic.appendChild(icono(it.icono));
    const tx = el('span', 'tarjeta__texto');
    tx.append(el('h3', null, it.nombre), el('p', null, it.descripcion));
    t.append(ic, tx);
    cont.appendChild(t);
  });
}

function pintarServicios(d) {
  document.getElementById('t-serv').firstChild.nodeValue = d.titulo + ' ';
  document.getElementById('servicios-total').textContent = d.total;
  const todos = document.getElementById('servicios-todos');
  todos.textContent = d.enlaceTodos.texto;
  todos.href = d.enlaceTodos.href;

  const cont = document.getElementById('servicios');
  d.destacados.forEach((s) => {
    const a = el('a', 'servicio servicio--' + s.tono);
    a.href = s.href;
    const cab = el('span', 'servicio__cab');
    const fl = el('span', 'flecha');
    fl.appendChild(icono('flecha'));
    cab.append(lineas(el('span', 'servicio__nombre'), s.nombre), fl);
    a.append(cab, el('span', 'servicio__desc', s.descripcion));
    cont.appendChild(a);
  });

  const otros = document.getElementById('servicios-otros');
  d.otros.forEach((o) => {
    const a = el('a', 'chip', o.texto);
    a.href = o.href;
    otros.appendChild(a);
  });
}

function pintarEquipo(d) {
  const sec = document.getElementById('equipo');
  const cab = el('div', 'equipo__cab');
  const h = el('h2', null, d.nombre);
  h.id = 't-eq';
  cab.append(h, el('span', null, d.descripcion));
  const ul = el('ul');
  d.miembros.forEach((m) => ul.appendChild(el('li', null, m)));
  sec.append(cab, ul);
}

// Titular: las palabras entran una a una
function titular() {
  const h = document.querySelector('.portada h1');
  let n = 0;
  (function recorrer(nodo) {
    Array.from(nodo.childNodes).forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.nodeValue.split(/\s+/).filter(Boolean).forEach((w) => {
          const s = el('span', 'palabra', w);
          s.style.setProperty('--i', n++);
          frag.append(s, document.createTextNode(' '));
        });
        nodo.replaceChild(frag, c);
      } else if (c.nodeType === 1 && c.tagName !== 'BR') {
        recorrer(c);
      }
    });
  })(h);
}

// Entrada escalonada de la cabecera
function entradas() {
  const grupos = ['.lateral__logo, .lateral__nav > *, .icono-nav--presentar, .lateral__sello', '.barra', '.portada__texto > :not(h1)', '.portada__panel-hueco'];
  const todos = [];
  grupos.forEach((sel) => {
    document.querySelectorAll(sel).forEach((n, i) => {
      n.classList.add('reveal');
      n.style.setProperty('--i', i);
      n.addEventListener('transitionend', function fin(e) {
        if (e.target !== n || e.propertyName !== 'opacity') return;
        n.classList.remove('reveal', 'visible');
        n.style.removeProperty('--i');
        n.removeEventListener('transitionend', fin);
      });
      todos.push(n);
    });
  });
  requestAnimationFrame(() => requestAnimationFrame(() => todos.forEach((n) => n.classList.add('visible'))));
}

// Estilo Apple: las secciones se despliegan al ritmo del scroll y la portada se aleja
function apple() {
  const items = [];
  const marcar = (sel, plano) => {
    document.querySelectorAll(sel).forEach((n, i) => {
      n.classList.add('scrub');
      if (plano) n.classList.add('scrub--plano');
      items.push({ n, i });
    });
  };
  marcar('#t-dim', true); marcar('.tarjeta'); marcar('.pestana', true);
  marcar('.servicio'); marcar('#servicios-otros', true); marcar('.equipo');
  const portada = document.querySelector('.portada');
  let pendiente = false;
  const limitar = (x) => Math.max(0, Math.min(1, x));
  const actualizar = () => {
    pendiente = false;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const y = window.scrollY;
    const final = limitar(1 - (max - y) / 260);
    portada.style.setProperty('--hp', limitar(y / (vh * 0.75)).toFixed(3));
    items.forEach((it) => {
      const r = it.n.getBoundingClientRect();
      const arriba = r.top + (it.i % 4) * 36;
      let p = limitar((vh * 0.98 - arriba) / (vh * 0.42));
      if (r.top < vh) p = Math.max(p, final);
      p = 1 - Math.pow(1 - p, 3);
      it.n.style.setProperty('--sp', p.toFixed(3));
    });
  };
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } };
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  actualizar();
}

// Panel oscuro: se inclina siguiendo el cursor
function inclinar() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  const a = document.querySelector('.panel');
  a.addEventListener('mousemove', (e) => {
    const r = a.getBoundingClientRect();
    a.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2) + 'deg');
    a.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - 0.5) * 8).toFixed(2) + 'deg');
  });
  a.addEventListener('mouseleave', () => { a.style.removeProperty('--rx'); a.style.removeProperty('--ry'); });
}

Promise.all([datos('prevision'), datos('dimensiones'), datos('servicios'), datos('equipo'), datos('fiesta-2027')])
  .then(([prevision, dimensiones, servicios, equipo, fiesta]) => {
    pintarPrevision(prevision, fiesta);
    pintarDimensiones(dimensiones);
    pintarServicios(servicios);
    pintarEquipo(equipo);
    if (!reducir) { titular(); entradas(); apple(); inclinar(); }
    listo();
  })
  .catch(mostrarError);
