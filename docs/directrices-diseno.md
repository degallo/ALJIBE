# Directrices de diseño: la gramática del aljibe

Guía del rediseño de la web y de la exposición. Se basa en *Fundamentos del diseño* de Wucius Wong (primera parte, «Diseño bi-dimensional») y, para la tipografía, en el *Manual de tipografía* de John Kane (2.ª ed.). Las páginas citadas son las de cada libro.

## 1. Por qué parecía hecho por una IA

El diseño anterior no tenía **estructura** en el sentido de Wong: era una suma de piezas sueltas (tarjetas redondeadas con sombra, iconos en círculos, fondos difuminados) colocadas por costumbre. Wong lo describe como el enfoque intuitivo: decidir «sobre la marcha lo que es hermoso o atractivo, sin saber conscientemente cómo y por qué» (p. 13). El rediseño sigue el enfoque contrario, el intelectual: cada decisión visual responde a una regla que se puede explicar.

**Prohibido a partir de ahora:** sombras, degradados, desenfoques, tarjetas con esquinas redondeadas, iconos dentro de círculos, emojis y adornos que no formen parte del sistema.

## 2. El módulo: el arco del aljibe

Wong: un diseño compuesto por «formas idénticas o similares» se basa en **módulos**, y los módulos «deben ser simples» (p. 51).

- **Módulo base:** el arco de herradura de la marca (un rectángulo coronado por un semicírculo, la bóveda del símbolo *Nivel de agua*). La marca ya lo define como «elemento gráfico propio» (`marca/README.md`).
- **Submódulo:** la lámina de agua, la parte inferior del arco rellena hasta una altura. Su altura **es un dato**.
- **Supermódulo:** cuatro arcos agrupados (p. 53, «el encuentro de los cuatro círculos»): sirven para los cuatro pasos, las cuatro dimensiones o los cuatro bloques financieros.
- El logotipo no se redibuja nunca: el módulo es una forma geométrica nueva derivada de la bóveda, no una copia del logo.

## 3. Forma: positivo y negativo

Wong trabaja en blanco y negro para entender la relación figura y fondo (p. 54) y muestra que una forma puede ser positiva o negativa y que la relación es reversible (pp. 47-48).

- **Dos valores, nunca más de tres:** `cal` (fondo) y `aljibe` (figura). `tinta` solo para texto. `agua` es la única nota de color y se reserva para el dato que importa (ver anomalía).
- Las diapositivas alternan fondo claro y fondo oscuro como **inversión** positivo y negativo del mismo sistema, no como dos estilos.
- **Interrelación de formas** (p. 49): cuando dos arcos se tocan, se superponen o se restan, la regla es la misma en toda la pieza. No se mezclan efectos.

## 4. Estructura: la retícula visible

Wong: «casi todos los diseños tienen una estructura», y puede ser formal, activa y **visible**: líneas estructurales reales que dividen el espacio (pp. 59-61).

- **Retícula formal de 12 columnas × 6 filas** en las diapositivas de 1920 × 1080, con márgenes de 120 px (el `space-6` de la marca ampliado).
- La retícula se **ve**: líneas finas de 1 px en `linea` o en `aljibe` al 25 %. Es la seña de identidad: los datos se colocan en celdas, como en las láminas del libro.
- Todo elemento se apoya en una línea de la retícula. No hay posiciones «a ojo».
- **Marco de referencia** (p. 44): una barra superior fina con el nombre de la sección a la izquierda y el número a la derecha, como las cabeceras del propio libro.

## 5. Repetición, similitud y gradación: los datos como forma

- **Repetición** (p. 51): una fila de arcos iguales da orden; se usa para contar (pasos, clientes, municipios).
- **Similitud** (p. 69): arcos «parecidos pero no idénticos» para cosas del mismo tipo con distinto valor (los segmentos de clientes).
- **Gradación** (pp. 75-79): la altura del agua cambia de un arco a otro siguiendo un dato real. Wong advierte que una gradación con muy pocos pasos «no produce ninguna sensación de gradación» (p. 77): cuando hay pocos datos se usa repetición, no gradación.
- **Velocidad de gradación** (p. 77): las animaciones solo hacen subir el agua; no aparecen, ni rebotan, ni giran.

## 6. Radiación: Granada como centro

Wong: la radiación tiene «un vigoroso punto focal» y «atrae de inmediato la atención» (p. 87).

- Se reserva para una sola idea: **Granada 2031** y el impacto que se proyecta desde un evento hacia fuera (estructura concéntrica, p. 88).
- No se usa como adorno de fondo.

## 7. Anomalía: el dato que importa

Wong: la anomalía es «un elemento singular dentro de una organización uniforme» y sirve para «atraer la atención» (p. 99).

- En cada diapositiva hay **una sola anomalía**: el módulo distinto (en `agua`, girado o lleno) que marca la idea principal. Ejemplo: en una fila de arcos vacíos, el de **los pueblos** está lleno.
- Es la regla que sustituye a «la tarjeta destacada en oscuro» del diseño anterior.

## 8. Tipografía (John Kane, *Manual de tipografía*)

**Gloock** para titulares y **Familjen Grotesk** para todo lo demás. Se eligió frente a otras ocho combinaciones probadas sobre la diapositiva de «Los pueblos».

- **Paleta corta** (p. 13): Kane observa que los buenos tipógrafos trabajan con muy pocos tipos. Aquí, dos.
- **Contraste con remates / de palo seco** (pp. 62-63): Gloock es una romana de alto contraste y Familjen Grotesk, una grotesca. El contraste entre ambas es la jerarquía; no hacen falta más colores ni tamaños intermedios.
- **Tipos display solo para titulares** (p. 14): están hechos «para ser vistos» más que para ser leídos. Gloock solo se usa a partir de 18 pt. Tiene un único peso: se fija en 400 y se desactiva la negrita falsa (`font-synthesis: none`).
- **Cifras con números tabulares** (p. 156): Familjen Grotesk sustituye a la monoespaciada; con `tabular-nums lining-nums` las cifras se alinean en tablas y gráficos.
- **Jerarquía en pocos niveles** (p. 146): titular (Gloock), texto (Familjen 400) y dato o etiqueta (Familjen 500-700, números tabulares).
- **Interlineado ajustado a mano** (p. 100): no se deja el 120 % por defecto. Titulares a 1-1,05; texto de lectura a 1,35-1,45 y líneas de unos 65 caracteres.
- **Escala corta y radical:** titular enorme (120-160 px) o texto pequeño (24-28 px) en las diapositivas, sin tamaños intermedios que compitan.
- Las etiquetas imitan las leyendas de las láminas de Wong (`fig. 04a`) y van en Familjen Grotesk con números tabulares.
- Alineación a la izquierda, en bandera, sobre la retícula. Nada centrado salvo la radiación.
- El logotipo no se toca: su nombre ya está convertido a trazos.

## 9. Movimiento

- Una sola animación por diapositiva y con significado: el agua sube hasta su nivel (gradación) o la retícula se traza (estructura).
- Respeta `prefers-reduced-motion`: sin animación, el diseño se ve completo.

## 10. Cómo se aplica

| Pieza | Principio de Wong que la organiza |
|---|---|
| Portada | Módulo y positivo/negativo: un solo arco grande, el lema |
| Problema | Repetición y anomalía: muchos arcos iguales, uno distinto |
| Solución | Supermódulo: cuatro arcos, cuatro pasos |
| Propuesta de valor | Anomalía: «Los pueblos» como el módulo lleno |
| Clientes | Similitud: tres arcos parecidos con distinto peso |
| Impacto y Granada 2031 | Radiación concéntrica |
| Enfoque financiero | Estructura visible: cuatro celdas de la retícula |
| Viabilidad | Gradación: el agua sube de un hito al siguiente |
| Equipo | Repetición: cinco módulos iguales |

La web sigue las mismas reglas: retícula visible, módulo del arco, dos valores y una sola anomalía por pantalla.

## Muestra

`web/propuestas/gramatica.html` aplica estas reglas a tres diapositivas con el contenido real (portada, propuesta de valor e impacto). Es una propuesta para comparar: no sustituye todavía a la exposición publicada.

## Contenido que no se toca (decisiones ya tomadas)

- Sin el 69 % de empresas sin asalariados.
- Propuesta de valor: la memoria de resultados de cada fiesta, con **los pueblos** como clave.
- Sin objetivos ni entrevistas en las diapositivas; el enfoque financiero solo muestra inversiones, gastos operativos, ingresos y financiación.
- Equipo con cargos, al mismo nivel, y última diapositiva «¡Muchas gracias!».

## Reglas que se mantienen

- Contraste mínimo de 4,5:1, botones reales, diseño que funcione en móvil.
- Logos de `marca/logos/` sin redibujar ni cambiar de color.
- Contenido de la exposición en `web/datos/exposicion.json`: el diseño cambia, el texto no.
