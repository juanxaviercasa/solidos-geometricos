# Generadores generales y editor cartesiano

Se conserva Generador inicial y se aplica a la región de partida completa.
Nuevos perfiles: segmento oblicuo, parábola, onda, Bézier cúbica, línea quebrada
y elipse exterior. Los abiertos no habilitan volumen: longitud, centroide y
superficie por suma de segmentos (320 para curvas suaves). La elipse exterior
usa área y volumen exactos y perímetro aproximado. Se rechazan curvas que
cruzan el eje, se autointersectan o contienen puntos inválidos.

Editor desplegable en canvas cartesiano: clic añade puntos, arrastre los mueve,
coordenadas editables, cuadrícula en cm, ajuste de 0,25 cm, encuadre, limpiar,
quitar último punto y aplicar como quebrada, Bézier o polígono. Aplicación
explícita del borrador, sin alterar el sólido mientras se dibuja.

Fórmulas generales con integrales y aproximación por segmentos; comparación
sin asignar volumen a curvas abiertas. Estilos responsive específicos.
Sintaxis de los cuatro módulos validada. Pendiente verificación visual,
arrastre táctil y revisión responsive del editor en navegador.

Referencias sin recuadro: letras con fondo transparente y halo fino, desplazadas
al costado del anclaje. Eje prolongado con flechas en ambos extremos y ajuste
del encuadre para incluirlo. Mostrar referencias controla también extremos
marcados y ficha cartesiana fuera del canvas, coordenadas del generador inicial
y centroide, distancia al eje y fórmulas de longitud recta/curva. Las curvas
suaves muestran muestras explícitamente, no se deduce su longitud solo de los
extremos. Sintaxis y diff comprobados; QA visual pendiente.

Nueva fase: editor centrado en O con cuatro cuadrantes, desplazamiento de plano,
zoom por rueda alrededor del cursor, botones de zoom, encuadre y fullscreen.
Herramienta independiente para mover eje vertical x = a. En visor: casilla de
planos XY/XZ/YZ y posición numérica del eje, con retorno a O. Coordenadas
originales preservadas; radios para revolución relativos al eje y signo del
lado de la figura. Distancia d = |xG − a|. Se rechaza el cruce del eje y se
conserva el último modelo válido. Añadidas integrales de superficie y volumen
con distancia al eje. Ejes oblicuos no incluidos en esta fase.
Pruebas de coordenadas negativas, eje desplazado y rechazo de cruces correctas.
Sintaxis comprobada; QA visual e interacción táctil todavía pendientes.

## Controles de edición e historial

Deshacer/Rehacer reemplazan Quitar último punto. Historial de hasta 100 estados
de puntos y tipo de generador; cada arrastre se confirma como una sola acción.
Nueva edición después de deshacer descarta la rama de rehacer. Limpiar es
reversible. Ctrl/Cmd+Z, Ctrl+Y y Ctrl/Cmd+Mayús+Z actúan dentro del editor y
respetan la edición nativa de campos de texto y números.
Herramienta de selección sin añadir puntos accidentalmente; eliminar selección
por botón o Supr; flechas desplazan 0,25 cm y Mayús+flechas 1 cm. Botones
deshabilitados cuando no hay acción disponible. No se incluyen zoom/pan en
el historial geométrico. Sintaxis y pruebas unitarias del historial correctas;
QA visual y táctil pendiente.

## Presentación, coordenadas y exportación

Pantalla completa: canvas sin controles al entrar, con barra Controles/Salir.
Los controles se abren en panel superpuesto sin reducir el gráfico y se
restauran en su lugar al salir. Entrada directa de pares x,y por lista, con
validación y carga al borrador deshacible. PNG del plano y del gráfico 3D,
además de SVG del trazado con metadatos de coordenadas y eje.

Edge sobre archivo local: fullscreen de Revolución a 390/768/1440 px, controles
ocultos y recuperables, canvas de altura completa, salida, carga de puntos,
Deshacer/Rehacer y descargas PNG/SVG correctos. Sin errores JavaScript.
Pendiente revisión de apariencia de las exportaciones y prueba táctil del editor.
