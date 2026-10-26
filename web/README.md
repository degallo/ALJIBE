# Web del prototipo de ALJIBE

Web completa del prototipo con las cuatro pantallas (Inicio, Servicios, Fiesta del Vino y Decisiones), los entregables de cada servicio para el Ayuntamiento de Alhama de Granada y un modo presentación para la clase.

## Cómo verla

Con servidor (recomendado, activa la API):

```
cd web
npm start            # http://localhost:8080
npm test             # 17 pruebas: cálculos y API
```

Necesita Node 18 o superior y no instala dependencias.

Sin servidor: la carpeta `web/` funciona también como web estática (GitHub Pages, cualquier alojamiento o la página publicada en claude.ai). En ese caso los cálculos se hacen en el navegador y lo que se registra en la Agenda o en el formulario de contacto se guarda solo en ese navegador. El pie de cada página indica en qué modo está.

No se puede abrir con doble clic (`file://`), porque el navegador bloquea la lectura de los JSON.

### Publicarla en GitHub Pages

La web está publicada en **https://degallo.github.io/ALJIBE/**. GitHub Pages sirve la rama `gh-pages`, y el flujo `.github/workflows/pages.yml` la actualiza solo cada vez que cambia `web/` en `main`, después de pasar las pruebas. Deja fuera el servidor, las pruebas y las capturas. También se puede lanzar a mano desde **Actions → Publicar la web en GitHub Pages → Run workflow**.

## Presentar en clase

- Pulsa **P** o el botón **Presentar en clase** de la barra lateral.
- **→**, **Espacio** o **Av Pág** avanzan; **←** o **Re Pág** retroceden. Funciona con mandos de presentación.
- **N** muestra las notas para quien presenta; **F** pone pantalla completa; **Esc** sale.
- Son 18 pasos que recorren la web de principio a fin y resaltan cada sección. En el paso del conteo, el día de la fiesta se reproduce solo.
- El guion completo está en `docs/guion-presentacion.md` y los pasos en `datos/presentacion.json`.

## Pantallas y entregables

| Página | Qué es |
| --- | --- |
| `index.html` | Inicio |
| `servicios.html` | Catálogo de servicios, Paquete Fiesta, Agenda ALJIBE (funcional) y formulario de diagnóstico |
| `fiesta-del-vino.html` | Cuadro de mando de la Fiesta del Vino 2027 |
| `decisiones.html` | Panel de decisiones con los tres casos de `docs/diseno-panel-decisiones.md` |
| `entregables/index.html` | Todo lo que recibe el Ayuntamiento, con el calendario del Paquete Fiesta |
| `entregables/informe-pleno.html` | **Entregable principal**: informe para el pleno en 5 hojas A4 (balance 2026, previsión y plan 2027, presupuesto, propuestas de acuerdo). Se imprime o se descarga en PDF (`entregables/descargas/`) |
| `entregables/radar.html` | Radar de temporada: índice semanal de intención frente a 2026 |
| `entregables/programacion.html` | Estudio de programación: ranking de artistas con pesos ajustables y ranking de fechas |
| `entregables/patrocinio.html` | Informe de patrocinio: dossier y calculadora de paquetes |
| `entregables/conteo.html` | Paquete Fiesta: simulación del conteo del día de la fiesta |
| `entregables/sala.html` | Suscripción esencial: cuadro de mando automático (sala de ejemplo) |
| `entregables/simulador.html` | Suscripción avanzada: previsión de demanda y simulador de escenarios |
| `entregables/impacto.html` | Proyectos a medida: informe de impacto con nivel de evidencia |

## Estructura

```
web/
  css/        estilos.css (tokens de marca y base), componentes.css, entregables.css, informe.css
  js/
    nucleo/   formato.js (formato español), calculos.js (lo usan navegador y servidor), api.js, dom.js, iconos.js
    marco.js  barra lateral común, pie con el estado del servidor
    efectos.js, presentacion.js
    paginas/  un módulo por pantalla
  datos/      todos los datos en JSON
  servidor/   servidor.js (sin dependencias)
  pruebas/    node --test
  logos/      copia exacta de marca/logos
```

## API

| Método y ruta | Qué hace |
| --- | --- |
| `GET /api/estado` | Comprueba que el servidor responde |
| `GET /api/datos/:nombre` | Devuelve un JSON de `datos/` |
| `POST /api/decisiones/:caso` | Recalcula un caso con `{ "activas": [...] }` |
| `GET /api/agenda/comprobar?fecha=AAAA-MM-DD` | Eventos, festivos, lluvia y riesgo de una fecha |
| `GET /api/agenda/eventos` y `POST /api/agenda/eventos` | Lista y registra eventos en la Agenda |
| `POST /api/contacto` | Guarda una petición de diagnóstico |

El servidor valida los datos, limita el tamaño de los envíos y el número de envíos por minuto, no publica su propio código ni lo que guarda (`servidor/almacen/`, fuera de git) y envía cabeceras de seguridad (CSP, `nosniff`).

## Cambiar los datos por datos reales

Las pantallas no llevan cifras escritas en el código: todo sale de `datos/*.json`. Para pasar a datos reales basta con sustituir esos archivos manteniendo los mismos campos. Tras cambiar `decisiones.json`, `agenda.json` o `fiesta-2027.json`, ejecuta `npm test`: las pruebas comprueban que los cálculos siguen cuadrando con lo que muestran las pantallas.

### Datos nuevos que hay que validar

Las cifras de los diseños y de la especificación de Decisiones se mantienen exactas. Para los entregables que no tenían diseño se han simulado datos nuevos, coherentes con los anteriores, que el equipo debe revisar:

- `radar.json`: índice semanal (2026 y 2027), señales y alertas.
- `programacion.json`: cinco opciones de artista anónimas, sus puntuaciones y cachés.
- `patrocinio.json`: edades, procedencia, gasto medio (17 €), alcance en redes (52.000) y precios de los paquetes.
- `conteo.json`: llegadas por hora, aforo (3.500) y vasos por persona.
- `sala.json`: sala de ejemplo (aforo, últimos conciertos, próximos conciertos y modelo del simulador). Sus KPIs son los del caso 3 de Decisiones.
- `impacto.json`: balance de 2026 (6.900 asistentes y −7 % del histórico; 27 familias, 4.000 l, 3.200 €, 38 % y 41 noticias del diseño; el resto, nuevo).
- `agenda.json`: eventos de la provincia y festivos de 2027, ajustados para que coincidan con las cuatro fechas del cuadro de mando.
- `informe-pleno.json`: textos del informe, calendario y propuestas de acuerdo.
