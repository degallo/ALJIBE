# Instrucciones para Claude Code

Vas a construir el prototipo web de ALJIBE a partir de los diseños de este repositorio. Responde y escribe la interfaz en español.

## Antes de empezar

1. Lee `README.md` (decisiones vigentes) y `marca/README.md` (identidad).
2. Si la sesión está vinculada al proyecto "CREACIÓN DE EMPRESAS" de claude.ai, lee el documento `claude/aljibe-contexto-prototipo.md` para el contexto de negocio. Ojo: lo que dice sobre el logo y sobre marcar los datos como simulados está superado por `README.md`.

## Qué construir

- Una web estática con cuatro pantallas: Inicio, Servicios, Fiesta del Vino (previsión 2027) y Decisiones.
- Inicio, Servicios y Fiesta del Vino: reproducir los `.dc.html` de `diseno/boceto-web/` (estructura, textos, cifras e interacciones). Las tres comparten el mismo estilo app: barra lateral de iconos, pestañas tipo píldora, fondo con brillos suaves, tarjetas muy redondeadas con degradado y panel lateral oscuro.
- Decisiones: construirla desde `docs/diseno-panel-decisiones.md`, con el estilo visual de `fiesta-del-vino-prevision.dc.html`.
- Los datos van en archivos JSON separados del código, de forma que más adelante se puedan sustituir por datos reales sin tocar las pantallas.

## Reglas de marca

- Colores, tipografía y espacios: `marca/tokens.json`. Schibsted Grotesk para texto y JetBrains Mono para cifras (Google Fonts).
- Logos: usa los SVG de `marca/logos/` tal cual; nunca los redibujes ni cambies sus colores.
- Iconos de línea estilo Lucide; sin emojis.
- Contraste mínimo de 4,5:1, botones reales con estado accesible y diseño que funcione en móvil.

## Cómo trabajar

- Empieza por una pantalla, enséñala y espera comentarios antes de seguir (el equipo prefiere iterar).
- Mantén las cifras exactamente como en los diseños y en las especificaciones.
