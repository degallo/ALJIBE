# ALJIBE · Prototipo

ALJIBE es una consultoría data driven para la cultura de Granada y su provincia. Lema: *Convertimos los datos de la cultura en decisiones.*

Proyecto de la asignatura Creación de Empresas (Universidad de Granada, curso 2026-27), Equipo 3, vinculado a la candidatura de Granada a Capital Europea de la Cultura 2031.

Este repositorio reúne el diseño del prototipo web para construirlo después con Claude Code. Todavía no hay código de producción: hay diseños de referencia y especificaciones.

## Contenido

| Carpeta | Qué hay |
| --- | --- |
| `marca/` | Identidad visual: guía de marca (`README.md`), tokens de color, tipografía y espacio (`tokens.json`) y logos en SVG |
| `marca/logos/` | Logo Nivel de agua: completo, en negativo, solo símbolo y solo nombre |
| `diseno/boceto-web/` | Pantallas del boceto web, exportadas del lienzo de diseño |
| `docs/` | Especificaciones de pantallas pendientes de construir |

### Pantallas del boceto

| Archivo | Pantalla | Estado |
| --- | --- | --- |
| `inicio.dc.html` | Portada: propuesta de valor, avance de la previsión, servicios y caso piloto | Diseño de referencia |
| `servicios.dc.html` | Catálogo de servicios, Paquete Fiesta y Agenda ALJIBE | Diseño de referencia |
| `fiesta-del-vino-prevision.dc.html` | Cuadro de mando de la Fiesta del Vino 2027 en estilo app: fecha óptima, asistencia prevista, histórico y campaña | **Estilo visual de referencia** para las pantallas de producto |
| `fiesta-del-vino-ficha-datos-reales.dc.html` | Ficha alternativa con solo datos publicados ("el aljibe se llena") | Variante; aún lleva el logo antiguo |
| `docs/diseno-panel-decisiones.md` | Panel de decisiones: KPIs por caso, decisiones con interruptor y resultados previstos | Especificación, sin diseñar en el lienzo |

Los archivos `.dc.html` son componentes del editor de diseño de Claude: HTML con estilos en línea más un bloque `<script type="text/x-dc">` con la lógica (`renderVals()`), y marcadores `{{ }}`, `<sc-for>` y `<sc-if>`. No se abren tal cual en el navegador; sirven como referencia exacta de estructura, estilos, textos y datos.

## Decisiones vigentes (26/10/2026)

- **Logo:** opción C, Nivel de agua (bóveda con agua y línea de datos; nombre "aljibe" en minúsculas). Sustituye al logo del círculo con arco y barras.
- **Datos de la demo:** se simulan 13 ediciones de la Fiesta del Vino (2013–2026, sin edición en 2021), coherentes con los datos publicados (unos 2.500 asistentes en 2016, unos 7.000 en 2024, aplazamiento al 28 de febrero en 2026). En la web no se etiquetan como simulados; se dice de palabra al exponer.
- **Previsión 2027:** fecha recomendada, sábado 20 de febrero; asistencia prevista de 7.600 (entre 6.900 y 8.300); 5.200 vasos; campaña desde el 11 de enero.
- Los precios de los servicios son hipótesis por validar.
