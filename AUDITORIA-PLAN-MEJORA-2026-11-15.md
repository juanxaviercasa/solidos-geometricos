# Auditoría integral y plan de mejora · Sólidos geométricos

Fecha: 15 de noviembre de 2026  
Repositorio: `juanxaviercasa/solidos-geometricos`  
Publicación: `https://solidosgeometricos.sistemazenit.com/`

## Resumen ejecutivo

El proyecto tiene una base funcional sólida: la navegación por hash funciona, la portada comunica los tres laboratorios, el visor 3D carga en producción, los desarrollos 2D y las rutas de recursos están conectados, los assets locales existen y el workflow de GitHub Pages terminó correctamente en el commit `a7097b0`.

El principal problema no era una ausencia de funcionalidades, sino una experiencia visual que había crecido por acumulación. La hoja principal supera las 1.000 líneas y contiene muchas capas de reglas posteriores para los mismos componentes (`.workspace`, `.stage`, `.inspector`, `.app-shell`, `.results-grid`, entre otros). Eso aumenta el riesgo de regresiones y hace que el diseño sea menos predecible en diferentes tamaños.

La portada ya tenía una dirección atractiva, pero el laboratorio necesitaba una separación más evidente entre el escenario manipulable, los controles y la ficha de datos. También hacía falta más contraste en los controles, estados activos más visibles y una jerarquía visual que guiara el recorrido: elegir sólido → observar → medir → comprobar.

## Hallazgos

### Correcto

- No se encontraron assets locales rotos en `dist/index.html`.
- Todos los archivos JavaScript del directorio `dist/` pasan `node --check`.
- GitHub Actions publica `dist/` y el último workflow revisado terminó con `success`.
- El canvas 3D aparece al entrar a `#laboratorio`; los tamaños en producción se calculan correctamente después de activar la ruta.
- La portada dispone de una propuesta comprensible, tres puntos de entrada y una ilustración propia.
- La navegación responsive y los recursos están presentes en escritorio y móvil.
- Existe soporte para tema oscuro, tamaño de lectura, impresión y teclado.

### Prioridad alta

1. **CSS acumulativo.** Hay múltiples bloques que redefinen los mismos selectores. Conviene consolidar las reglas en una futura fase, sin hacerlo en la misma entrega que los cambios visuales para reducir riesgo.
2. **Jerarquía del laboratorio.** La columna de controles y la ficha de propiedades compiten con el modelo 3D. La nueva capa visual marca el escenario con un fondo propio, separa los paneles y refuerza los estados activos.
3. **Contraste de controles.** Botones de zoom, rotación y centrado eran demasiado neutros. Se reforzaron con fondo, profundidad, hover y foco visible.
4. **Densidad de la ficha.** Las métricas, Euler y resultados se presentan como bloques más distinguibles, con superficies y bordes diferenciados.
5. **Accesibilidad puntual.** `foldRange` no tenía una etiqueta explícita asociada. Se corrigió con un `label` visualmente oculto.

### Prioridad media

- Añadir pruebas de interacción automatizadas para cambiar familia, activar Rayos X, entrar en Desarrollo 2D, plegar al 50 % y cambiar a Cuerpos redondos.
- Revisar con usuarios reales si “Rayos X”, “Aristas” y “Vértices” se entienden sin abrir una guía.
- Añadir indicadores persistentes de “paso actual” en la ruta sugerida cuando el estudiante completa una acción.
- Comprobar el encuadre visual de todas las familias arquimedianas y de prismas en móviles físicos, no solo en ventanas simuladas.
- Comprimir o servir la ilustración de portada en formatos modernos si el proveedor lo permite; el PNG actual pesa aproximadamente 1,8 MB.

### Prioridad baja

- Separar estilos base, componentes, responsive y recursos en hojas con responsabilidades claras.
- Añadir un pequeño sistema de tokens documentado para color, radios, sombra y espaciado.
- Incorporar una página de diagnóstico no publicada para revisar WebGL, carga de CDN y estado de las rutas.

## Dirección visual aplicada

La mejora aplicada usa una idea de **estudio geométrico editorial**: una interfaz luminosa, de alto contraste y con acentos violeta/lima/coral. La portada gana profundidad y estados hover más vivos; el laboratorio trata el canvas como una mesa de trabajo diferenciada; los paneles usan superficies suaves para mantener la atención en el sólido sin esconder las fórmulas.

La capa se añadió como `dist/visual-refresh.css` y se carga después de las hojas actuales. No cambia geometría, fórmulas, cálculos, rutas ni listeners. También se añadió una versión explícita al enlace CSS para evitar que una caché antigua oculte la mejora.

## Plan de mejora recomendado

### Fase 1 · Validación visual y accesibilidad

- Validar escritorio a 1280, 1440 y 1920 px.
- Validar móvil a 360, 390 y 430 px.
- Repetir la prueba con tema oscuro y modo aula.
- Ejecutar navegación por teclado desde la portada hasta el laboratorio.
- Verificar que el modelo completo siga dentro del encuadre para cada familia.

### Fase 2 · Arquitectura CSS

- Extraer tokens y reglas compartidas.
- Consolidar breakpoints en una única sección responsive.
- Eliminar redefiniciones históricas después de comparar capturas antes/después.
- Mantener una hoja de compatibilidad separada solo para impresión y recursos heredados.

### Fase 3 · Aprendizaje guiado

- Convertir “Ruta sugerida” en un indicador de progreso real.
- Mostrar una microexplicación contextual al activar cada insight.
- Añadir una acción primaria única por estado: “Observar”, “Medir” o “Comprobar”.
- Guardar el último sólido y el avance del reto en `localStorage` con una opción clara para reiniciar.

### Fase 4 · Rendimiento y robustez

- Servir la ilustración de portada en WebP/AVIF con fallback PNG.
- Añadir comprobación de WebGL y mensaje pedagógico si Three.js no puede inicializarse.
- Añadir smoke tests de las rutas principales y de los controles 3D/2D.
- Validar impresión física de al menos un poliedro, un cilindro y un cono.

## Entrega de esta auditoría

- Auditoría documentada en este archivo.
- Nueva capa visual transversal: `dist/visual-refresh.css`.
- Corrección de etiqueta accesible para el progreso de plegado.
- Sin cambios a la lógica geométrica ni a las funcionalidades interactivas.

## Fase 2 implementada en esta entrega

Se añadió persistencia local del avance de los retos mediante `localStorage`, limitada al navegador del estudiante y sin enviar datos a ningún servidor. Al volver al sitio se conserva la pregunta y la puntuación del reto general; cambiar de ámbito o reiniciar el reto limpia ese estado de forma explícita.

Se incorporó una recuperación pedagógica para WebGL. Si el visor 3D no puede crear el contexto gráfico, la aplicación ya no queda en un canvas vacío: muestra un aviso claro y mantiene disponibles la ficha, las fórmulas y el desarrollo 2D. El motor 2D también usa un renderer seguro para evitar que ese fallo bloquee el resto de la aplicación.

Se añadió `scripts/smoke-test.mjs` y se integró al workflow de Pages. La prueba comprueba la presencia de los archivos esenciales, el HTML en español, el canvas 3D, el fallback WebGL, la etiqueta accesible del progreso de plegado y la capa visual. Esto no sustituye las pruebas de interacción del navegador, pero detecta rápidamente una publicación incompleta.

También se actualizaron las versiones de las acciones de checkout y upload a versiones estables, manteniendo permisos mínimos para Pages. El contenido y las fórmulas no fueron modificados.
