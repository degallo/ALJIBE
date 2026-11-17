# Diseño alternativo de la exposición

**Estado:** pendiente. Se trabajará en sesiones posteriores. Hasta entonces se queda publicado el diseño actual (`web/presentacion.html`, `web/css/diapositivas.css`).

## Por qué

El profesorado ha dicho que el diseño de las diapositivas es el mismo que hacen todas las IAs. Hay que buscar una alternativa más única y distinta del resto.

## Qué hace que el diseño actual parezca genérico

- Tarjetas redondeadas con sombra suave y degradado en casi todas las diapositivas.
- Iconos de línea dentro de círculos.
- Paleta verde azulada con fondos difuminados, que no habla de Granada.
- La misma estructura casi siempre: titular arriba, tarjetas debajo y una frase al pie.
- Animaciones de entrada iguales en todas (aparecer, subir, rebotar).

## Qué tiene ALJIBE que casi nadie más tiene

- El **aljibe** y el **arco de herradura** de la marca (se usan como forma, no solo como adorno).
- **Granada**: azulejo, lacería, el Albaicín y la cal.
- **Cifras reales** del prototipo: gráficas de verdad en vez de tarjetas.
- El lema «Convertimos los datos de la cultura en decisiones» y la idea del agua que se recoge y se reparte.

## A decidir con el equipo

1. Referentes: qué presentaciones o piezas gráficas os gustan.
2. Tono: editorial y sobrio, o gráfico y atrevido.
3. Marca: ¿se respetan las reglas de `marca/` (colores, tipografías y logo) o se pueden romper? Los logos nunca se redibujan ni se cambian de color.
4. Formato: ¿una sola alternativa o dos para comparar?

## Cómo trabajarlo

- Hacer el diseño nuevo **como alternativa aparte**, sin tocar el actual, para compararlos y que el equipo elija.
- Mantener el contenido: sale de `web/datos/exposicion.json` y no debe cambiar al cambiar el diseño.
- Mantener lo que ya funciona: 10 diapositivas como máximo, 4 minutos, notas del orador, cronómetro, PDF para el profesor y accesibilidad (contraste mínimo de 4,5:1 y `prefers-reduced-motion`).
- Probar siempre a 1920 × 1080 y en móvil, y regenerar el PDF con `npm run pdf` (comprobar que sigue pesando poco y sin imágenes).

## Contenido que no se toca (decisiones ya tomadas)

- Sin el 69 % de empresas sin asalariados.
- La propuesta de valor es la memoria de resultados de cada fiesta, con **los pueblos** como clave.
- Sin objetivos ni entrevistas en las diapositivas; el enfoque financiero solo muestra inversiones, gastos operativos, ingresos y financiación.
- Equipo con cargos, al mismo nivel, y última diapositiva «¡Muchas gracias!».
