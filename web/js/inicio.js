/* Pantalla Inicio: pinta las secciones a partir de los JSON de web/datos/ */
(function () {
  var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducir) document.documentElement.classList.add('js');
  var NS = 'http://www.w3.org/2000/svg';

  // Iconos de línea estilo Lucide (contenido del <svg viewBox="0 0 24 24">)
  var ICONOS = {
    usuarios: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    copa: '<path d="M8 22h8M12 15v7M7 2h10l-1 7a4 4 0 0 1-8 0z"/>',
    corazon: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    mundo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    flecha: '<path d="M7 17 17 7M8 7h9v9"/>'
  };

  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function icono(nombre) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = ICONOS[nombre];
    return s;
  }

  // Texto con saltos de línea: ["Radar de", "temporada"]
  function lineas(nodo, partes) {
    partes.forEach(function (t, i) {
      if (i) nodo.appendChild(document.createElement('br'));
      nodo.appendChild(document.createTextNode(t));
    });
  }

  // La cifra sube desde 0 hasta su valor, con puntos de millar
  function contar(nodo) {
    var final = nodo.textContent;
    var meta = parseInt(final.replace(/\D/g, ''), 10);
    if (reducir || !meta) return;
    var inicio = null, duracion = 1400;
    nodo.textContent = '0';
    function paso(ts) {
      if (inicio === null) inicio = ts;
      var k = Math.min((ts - inicio) / duracion, 1);
      var v = Math.round(meta * (1 - Math.pow(1 - k, 3)));
      nodo.textContent = k < 1 ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : final;
      if (k < 1) requestAnimationFrame(paso);
    }
    setTimeout(function () { requestAnimationFrame(paso); }, 500);
  }

  // Los bloques aparecen al entrar en pantalla, de uno en uno
  function entradas() {
    var grupos = [
      ['.lateral > *'], ['.barra'], ['.portada__texto > :not(h1)'], ['.portada__panel-hueco'],
      []
    ];
    var todos = [];
    grupos.forEach(function (g) {
      document.querySelectorAll(g[0]).forEach(function (n, i) {
        n.classList.add('reveal');
        n.addEventListener('transitionend', function fin(e) {
          if (e.target !== n || e.propertyName !== 'opacity') return;
          n.classList.remove('reveal', 'visible');
          n.style.removeProperty('--i');
          n.removeEventListener('transitionend', fin);
        });
        n.style.setProperty('--i', i);
        todos.push(n);
      });
    });
    if (!('IntersectionObserver' in window)) {
      todos.forEach(function (n) { n.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        if (it.isIntersecting) { it.target.classList.add('visible'); obs.unobserve(it.target); }
      });
    }, { threshold: 0.12 });
    todos.forEach(function (n) { obs.observe(n); });
  }

  // Titular: las palabras entran una a una
  function titular() {
    var h = document.querySelector('.portada h1');
    var n = 0;
    (function recorrer(nodo) {
      Array.prototype.slice.call(nodo.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.nodeValue.split(/\s+/).filter(Boolean).forEach(function (w, i, a) {
            var s = el('span', 'palabra', w);
            s.style.setProperty('--i', n++);
            frag.appendChild(s);
            frag.appendChild(document.createTextNode(' '));
          });
          nodo.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') {
          recorrer(c);
        }
      });
    })(h);
  }

  // Panel oscuro: se inclina siguiendo el cursor
  function inclinar() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    var a = document.querySelector('.panel');
    a.addEventListener('mousemove', function (e) {
      var r = a.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      a.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
      a.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
    });
    a.addEventListener('mouseleave', function () {
      a.style.removeProperty('--rx');
      a.style.removeProperty('--ry');
    });
  }

  // Barra de progreso de lectura
  function progreso() {
    var b = el('div', 'progreso');
    b.setAttribute('aria-hidden', 'true');
    document.body.appendChild(b);
    function act() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      b.style.setProperty('--p', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    }
    window.addEventListener('scroll', act, { passive: true });
    window.addEventListener('resize', act);
    act();
  }

  // Foco de luz que sigue al cursor y botones con efecto imán
  function cursor() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.tarjeta, .servicio').forEach(function (n) {
      n.addEventListener('mousemove', function (e) {
        var r = n.getBoundingClientRect();
        n.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        n.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    document.querySelectorAll('.boton, .icono-nav').forEach(function (n) {
      n.addEventListener('mousemove', function (e) {
        var r = n.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
        n.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
      });
      n.addEventListener('mouseleave', function () { n.style.translate = ''; });
    });
  }

  // Estilo Apple: las secciones se despliegan al ritmo del scroll y la portada se aleja
  function apple() {
    var items = [];
    function marcar(sel, plano) {
      document.querySelectorAll(sel).forEach(function (n, i) {
        n.classList.add('scrub');
        if (plano) n.classList.add('scrub--plano');
        items.push({ n: n, i: i });
      });
    }
    marcar('#t-dim', true); marcar('.tarjeta'); marcar('.pestana', true);
    marcar('.servicio'); marcar('#servicios-otros', true); marcar('.equipo');
    var portada = document.querySelector('.portada');
    var barra = document.querySelector('.barra');
    var pendiente = false;

    function limitar(x) { return Math.max(0, Math.min(1, x)); }
    function actualizar() {
      pendiente = false;
      var vh = window.innerHeight;
      var max = document.documentElement.scrollHeight - vh;
      var y = window.scrollY;
      var final = limitar(1 - (max - y) / 260);
      portada.style.setProperty('--hp', limitar(y / (vh * 0.75)).toFixed(3));
      barra.classList.toggle('barra--fija', y > 24);
      items.forEach(function (it) {
        var r = it.n.getBoundingClientRect();
        var arriba = r.top + (it.i % 4) * 36;
        var p = limitar((vh * 0.98 - arriba) / (vh * 0.42));
        if (r.top < vh) p = Math.max(p, final);
        p = 1 - Math.pow(1 - p, 3);
        it.n.style.setProperty('--sp', p.toFixed(3));
      });
    }
    function pedir() { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } }
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    actualizar();
  }

  function cargar(archivo) {
    return fetch('datos/' + archivo).then(function (r) {
      if (!r.ok) throw new Error(archivo + ': ' + r.status);
      return r.json();
    });
  }

  function pintarPrevision(d) {
    var a = el('a', 'panel');
    a.href = d.href;
    a.setAttribute('aria-label', 'Abrir la previsión de la ' + d.titulo.join(' '));

    var cab = el('div', 'panel__cab');
    var marca = el('span', 'panel__marca');
    var ic = el('span', 'panel__icono');
    ic.appendChild(icono('copa'));
    var nombre = el('span', 'panel__nombre');
    lineas(nombre, d.titulo);
    marca.append(ic, nombre);
    var fl = el('span', 'flecha');
    fl.appendChild(icono('flecha'));
    cab.append(marca, fl);

    var cifra = el('div', 'panel__cifra');
    cifra.append(el('span', 'panel__etiqueta', d.etiquetaCifra), el('span', 'panel__valor', d.cifra));

    var barras = el('div', 'panel__barras');
    barras.setAttribute('aria-hidden', 'true');
    d.serie.forEach(function (h) {
      var b = document.createElement('span');
      b.style.height = h + 'px';
      b.style.setProperty('--i', barras.children.length);
      barras.appendChild(b);
    });

    var datos = el('div', 'panel__datos');
    d.datos.forEach(function (x) {
      var c = el('span', 'panel__dato');
      c.append(el('small', null, x.etiqueta), el('strong', null, x.valor));
      datos.appendChild(c);
    });

    a.append(cab, cifra, barras, datos);
    document.getElementById('prevision').appendChild(a);
    contar(cifra.querySelector('.panel__valor'));
  }

  function pintarDimensiones(d) {
    document.getElementById('t-dim').textContent = d.titulo;
    var cont = document.getElementById('dimensiones');
    d.items.forEach(function (it) {
      var t = el('article', 'tarjeta');
      var ic = el('span', 'tarjeta__icono');
      ic.appendChild(icono(it.icono));
      var tx = el('span', 'tarjeta__texto');
      tx.append(el('h3', null, it.nombre), el('p', null, it.descripcion));
      t.append(ic, tx);
      cont.appendChild(t);
    });
  }

  function pintarServicios(d) {
    var titulo = document.getElementById('t-serv');
    titulo.firstChild.nodeValue = d.titulo + ' ';
    document.getElementById('servicios-total').textContent = d.total;
    var todos = document.getElementById('servicios-todos');
    todos.textContent = d.enlaceTodos.texto;
    todos.href = d.enlaceTodos.href;

    var cont = document.getElementById('servicios');
    d.destacados.forEach(function (s) {
      var a = el('a', 'servicio servicio--' + s.tono);
      a.href = d.enlaceTodos.href;
      var cab = el('span', 'servicio__cab');
      var n = el('span', 'servicio__nombre');
      lineas(n, s.nombre);
      var fl = el('span', 'flecha');
      fl.appendChild(icono('flecha'));
      cab.append(n, fl);
      a.append(cab, el('span', 'servicio__desc', s.descripcion));
      cont.appendChild(a);
    });

    var otros = document.getElementById('servicios-otros');
    d.otros.forEach(function (t) {
      var a = el('a', 'chip', t);
      a.href = d.enlaceTodos.href;
      otros.appendChild(a);
    });
  }

  function pintarEquipo(d) {
    var sec = document.getElementById('equipo');
    var cab = el('div', 'equipo__cab');
    var h = el('h2', null, d.nombre);
    h.id = 't-eq';
    cab.append(h, el('span', null, d.descripcion));
    var ul = el('ul');
    d.miembros.forEach(function (m) { ul.appendChild(el('li', null, m)); });
    sec.append(cab, ul);
  }

  Promise.all([
    cargar('prevision.json'), cargar('dimensiones.json'),
    cargar('servicios.json'), cargar('equipo.json')
  ]).then(function (r) {
    pintarPrevision(r[0]);
    pintarDimensiones(r[1]);
    pintarServicios(r[2]);
    pintarEquipo(r[3]);
    if (!reducir) { titular(); entradas(); apple(); inclinar(); progreso(); cursor(); }
  }).catch(function (e) {
    var aviso = el('p', 'aviso-datos', 'No se han podido cargar los datos. Abre la web desde un servidor local (por ejemplo, python3 -m http.server en la carpeta web).');
    aviso.setAttribute('role', 'alert');
    document.querySelector('.contenido').appendChild(aviso);
    console.error(e);
  });
})();
