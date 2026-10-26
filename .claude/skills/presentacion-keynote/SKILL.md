---
name: presentacion-keynote
description: Úsala cuando se construya o retoque algo que se va a exponer en clase (modo presentación, pantallas de demo, guion). Estilo keynote sobrio: una idea por pantalla, cifras enormes, mucho aire y cero ruido.
---

# Presentación estilo keynote para ALJIBE

La demo se expone en clase. Los profesores no leen tablas: miran una pantalla y escuchan a quien habla. Todo debe entenderse en 3 segundos.

## Principios

1. **Una idea por pantalla.** Si una pantalla necesita dos explicaciones, son dos pantallas.
2. **La cifra es la protagonista.** Un número enorme (7.600, 20 feb) en JetBrains Mono, con una frase corta debajo. Nada de tablas densas.
3. **Aire.** Márgenes generosos, pocos elementos, un solo color de acento (agua #2E8C9C) sobre aljibe #004C59 o cal #F6F3EE.
4. **Titulares que afirman**, no que describen: "El 20 de febrero llenaremos el aljibe", no "Resultados de la previsión".
5. **Movimiento con intención.** Una animación suave por pantalla (una cifra que sube, una barra que se llena), máximo 600 ms. Respeta `prefers-reduced-motion`.
6. **Sin viñetas largas, sin emojis, sin adornos.** Si algo no ayuda a la historia, se quita.

## Guion de la demo (orden recomendado)

1. Problema: la cultura de Granada decide a ojo.
2. Idea: convertimos los datos de la cultura en decisiones (logo y lema).
3. Prueba: la Fiesta del Vino 2027, con fecha recomendada y asistencia prevista.
4. Decisión: qué hacer, con KPIs y resultado previsto (panel de decisiones).
5. Negocio: servicios y paquete Fiesta.
6. Cierre: una sola frase y el logo.

## Modo presentación (qué construir)

- Ruta `presentacion.html`: pantalla completa, una diapositiva por pantalla, avance con flechas del teclado y clic, indicador de progreso fino, tecla `F` para pantalla completa.
- Reutiliza los datos de `web/datos/`; no dupliques cifras.
- Legible a 5 metros: cifras principales de al menos 120 px en escritorio, texto de apoyo de al menos 28 px.
- Contraste mínimo 4,5:1, pensado para proyector (evitar grises claros sobre blanco).
