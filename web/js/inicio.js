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
      ['.lateral > *'], ['.barra'], ['.portada__texto > *'], ['.portada__panel-hueco'],
      ['#t-dim'], ['.tarjeta'], ['.pestana'], ['.servicio'], ['#servicios-otros .chip'], ['.equipo']
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
    if (!reducir) entradas();
  }).catch(function (e) {
    var aviso = el('p', 'aviso-datos', 'No se han podido cargar los datos. Abre la web desde un servidor local (por ejemplo, python3 -m http.server en la carpeta web).');
    aviso.setAttribute('role', 'alert');
    document.querySelector('.contenido').appendChild(aviso);
    console.error(e);
  });
})();
