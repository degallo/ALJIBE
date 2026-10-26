# ALJIBE — Panel de decisiones (diseño para Claude Code)

Estado: diseño cerrado, pendiente de construir. Fecha: 26/10/2026.

## Para qué sirve

Es la pieza que cierra el ciclo de ALJIBE (recoger, unificar, analizar, **decidir** y medir): convierte los datos en decisiones. El gestor ve sus KPIs, cuáles son sus objetivos y qué resultado se prevé si aplica cada decisión recomendada. Activa o desactiva decisiones y las previsiones se recalculan al momento.

Idea clave para la exposición: los KPIs no son fijos, **se adaptan a cada tipo de cliente**. Por eso el panel tiene un selector de caso.

## Encaje en la web del prototipo

- Nueva pantalla "Decisiones", al mismo nivel que el cuadro de mando de la Fiesta del Vino.
- Enlaces: un icono nuevo en la barra lateral (diana u objetivo) y una pestaña "Decisiones" en el menú de píldoras del cuadro de mando.
- Referencia visual: la pantalla "Fiesta del Vino: previsión 2027" (`diseno/boceto-web/Main.dc.html` en este repositorio; estilo app: barra lateral de iconos redondos, pestañas tipo píldora, cifras grandes, tarjetas blancas con radio 28–32 px, panel lateral oscuro con degradado de marca).
- Identidad: `marca/` en este repositorio (colores `aljibe` #004C59, `agua` #2E8C9C, `agua-soft` #CFE6EA, `cal` #F6F3EE, `arena` #E6DFD3, `tinta` #10262B, `alerta` #B4521A; Schibsted Grotesk y JetBrains Mono para cifras). Logo: versión Nivel de agua.
- Los datos son simulados y no se marcan como tales en pantalla (decisión del equipo para la demo).

## Estructura de la pantalla

1. **Barra lateral** (igual que el cuadro de mando), con el icono de Decisiones activo.
2. **Cabecera**: título "Del dato a la decisión" y segunda línea en gris "Qué hacer y qué esperar si lo hacemos."
3. **Selector de caso** (píldoras; la activa en oscuro): Fiesta del Vino · Festival de verano · Sala de conciertos.
4. **Zona izquierda: 4 tarjetas de KPI** (rejilla 2 × 2). Cada tarjeta muestra:
   - Nombre del KPI.
   - "Hoy": valor de partida (pequeño, gris).
   - "Con las decisiones": valor previsto (cifra grande).
   - Objetivo.
   - Barra de progreso hacia el objetivo.
   - Etiqueta de estado: "Objetivo alcanzado" (fondo `agua-soft`) o "Faltan X" (texto `alerta`, siempre con palabra, no solo color).
5. **Zona derecha: panel oscuro "Decisiones recomendadas"**:
   - Lista de decisiones con interruptor (botón con estado activado o desactivado). Cada una muestra título, coste y una línea con su efecto.
   - Al pie: inversión total, valor generado y retorno ("X € por cada euro invertido").
   - Botón "Descargar plan de acción" (no funcional en el prototipo).
6. **Franja inferior "Resultado si aplicas el plan"**: 3 cifras grandes (el KPI principal del caso, la inversión total y el retorno por euro).

Comportamiento: por defecto, todas las decisiones del caso están activadas. Al cambiar de caso se cargan sus KPIs y decisiones, y se conserva lo que el usuario había activado o desactivado en cada caso.

## Cálculo

- Valor previsto de un KPI = valor de hoy + suma de los efectos de las decisiones activas sobre ese KPI.
- Hay KPIs en los que **más es mejor** y otros en los que **menos es mejor** (por ejemplo, el coste de captación). Progreso: previsto ÷ objetivo en el primer caso, y objetivo ÷ previsto en el segundo, con un tope del 100 %.
- Inversión = suma de costes de las decisiones activas.
- Valor generado = suma del "valor €" de las decisiones activas.
- Retorno = valor generado ÷ inversión (si la inversión es 0, mostrar "sin coste").
- Formato español: punto de miles y coma decimal; € y % con espacio delante.

## Caso 1 · Fiesta del Vino (Alhama de Granada, edición 2027)

Partida "hoy" = repetir el plan de 2026 (fecha del 27 de febrero, mismo formato).

| KPI | Hoy | Objetivo | Sentido |
| --- | --- | --- | --- |
| Asistentes | 7.100 | 8.000 | más es mejor |
| Público de fuera de la comarca | 36 % | 45 % | más es mejor |
| Ingresos de la fiesta | 15.600 € | 19.000 € | más es mejor |
| Gasto en comercios del pueblo | 120.000 € | 150.000 € | más es mejor |

| Decisión | Coste | Asistentes | Fuera | Ingresos | Gasto pueblo | Valor € |
| --- | --- | --- | --- | --- | --- | --- |
| Celebrarla el sábado 20 de febrero | 0 € | +500 | +1 pp | +1.100 € | +9.000 € | 10.100 € |
| Campaña digital desde el 11 de enero | 600 € | +350 | +5 pp | +800 € | +7.500 € | 8.300 € |
| Preparar 5.200 vasos y una segunda barra | 900 € | 0 | 0 | +2.600 € | 0 | 2.600 € |
| Bus lanzadera desde Granada | 1.200 € | +250 | +4 pp | +600 € | +6.500 € | 7.100 € |
| Ruta de tapas con los bares del pueblo | 300 € | 0 | 0 | 0 | +12.000 € | 12.000 € |

Con todo activado: 8.200 asistentes, 46 %, 20.700 € y 155.000 €; se alcanzan los cuatro objetivos. Inversión de 3.000 € y retorno de 13,4 € por euro.

## Caso 2 · Festival de verano (ejemplo, 3 días)

| KPI | Hoy | Objetivo | Sentido |
| --- | --- | --- | --- |
| Abonos vendidos | 4.200 | 5.000 | más es mejor |
| Público de fuera de Granada | 28 % | 35 % | más es mejor |
| Ingresos de patrocinio | 18.000 € | 25.000 € | más es mejor |
| Coste de captación por abono | 6,0 € | 4,5 € | menos es mejor |

| Decisión | Coste | Abonos | Fuera | Patrocinio | Coste captación | Valor € |
| --- | --- | --- | --- | --- | --- | --- |
| Cartel según la afinidad del público | 800 € | +400 | +3 pp | 0 | −0,6 € | 16.000 € |
| Precios por tramos con venta anticipada | 0 € | +300 | +1 pp | 0 | −0,4 € | 12.000 € |
| Dossier de patrocinio con datos del público | 300 € | 0 | 0 | +6.000 € | 0 | 6.000 € |
| Campaña segmentada fuera de Granada | 1.500 € | +250 | +5 pp | +1.500 € | −0,3 € | 11.500 € |

Con todo activado: 5.150 abonos, 37 % y 25.500 € (objetivos alcanzados), pero el coste de captación queda en 4,7 €, así que **faltan 0,2 € para el objetivo**. Conviene mantenerlo: demuestra que el panel no promete todo. Inversión de 2.600 € y retorno de 17,5 € por euro.

## Caso 3 · Sala de conciertos (temporada de 40 conciertos)

| KPI | Hoy | Objetivo | Sentido |
| --- | --- | --- | --- |
| Ocupación media | 61 % | 75 % | más es mejor |
| Público que repite | 22 % | 30 % | más es mejor |
| Ingreso medio por concierto | 3.400 € | 4.000 € | más es mejor |
| Conciertos con pérdidas | 9 | 4 | menos es mejor |

| Decisión | Coste | Ocupación | Repite | Ingreso medio | Con pérdidas | Valor € |
| --- | --- | --- | --- | --- | --- | --- |
| Pasar los conciertos flojos del martes al jueves | 0 € | +5 pp | 0 | +200 € | −2 | 8.000 € |
| Bono de 5 conciertos para habituales | 200 € | +3 pp | +6 pp | +150 € | −1 | 6.000 € |
| Alertas semanales de venta lenta | 2.400 € | +4 pp | 0 | +250 € | −2 | 10.000 € |
| Oferta de barra según el perfil del público | 500 € | 0 | 0 | +300 € | −1 | 12.000 € |

Con todo activado: ingreso medio de 4.300 € y 3 conciertos con pérdidas (objetivos alcanzados). La ocupación se queda en 73 % (faltan 2 pp) y el público que repite en 28 % (faltan 2 pp). Inversión de 3.100 € y retorno de 11,6 € por euro.

## Accesibilidad y detalles

- Los interruptores son botones reales con estado accesible (activado o desactivado) y una zona táctil de al menos 44 px.
- Las cifras que cambian se anuncian a lectores de pantalla (región en directo).
- Contraste mínimo de 4,5:1 en todo el texto, también sobre el panel oscuro.
- En móvil, las tarjetas de KPI pasan a una columna y el panel de decisiones va debajo.

## Más adelante (fuera del prototipo)

- Sustituir las cifras fijas por el modelo real: los efectos de cada decisión se estiman con los datos del cliente.
- Permitir que el gestor edite los objetivos y añada sus propios KPIs.
- Exportar el plan de acción en PDF.
