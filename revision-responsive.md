# Revisión responsive — 22 de octubre de 2026

## Alcance

Pruebas automatizadas en Edge de escritorio con ventanas de 320, 360, 390,
600, 768, 820, 1024, 1180, 1280, 1440 y 1920 píxeles de ancho.
Se revisaron los tamaños de lectura normal y aula/proyector.
Son tamaños de ventana simulados, no pruebas en teléfonos físicos.

Páginas: laboratorio, teoría (fundamentos, regulares y ángulos), medidas,
impresión, retos, guía, glosario y apariencia. También se revisó el desarrollo 2D.

## Correcciones

- Arista señalada: título legible, línea de referencia más larga y medida grande.
- Controles 2D móviles: etiquetas completas en dos columnas, referencia de arista
  en una fila independiente y botones Mover/Girar separados de Reducir/Centrar/Ampliar.
- Pestañas de familias y tarjetas: reorganización sin recortar nombres.
- Formularios estrechos: los controles pasan a otra fila cuando es necesario.
- El selector de decimales crece con el tamaño del texto.
- En modo aula y pantalla muy estrecha, las medidas 3D/2D se presentan en una columna.
- En tablet y modo aula, la columna 2D es más ancha y las cifras no se parten
  entre líneas. Las etiquetas de conteo cambian de distribución si no caben.

La pasada general detectó problemas locales de texto que se corrigieron. La
comprobación final del laboratorio, medidas y vista 2D a 320, 390, 768 y 1280
píxeles, en lectura normal y aula, terminó sin desbordamientos de página,
recortes de controles detectados ni errores de ejecución.

## Comprobaciones funcionales

En 320, 390, 768, 1024 y 1280 píxeles: ocultar/mostrar panel, zoom, giro,
centrado, plegado/desplegado, progreso manual e información del diedro.
Vista previa A2 en cuatro hojas A4. Prisma configurable de 24 lados y cálculo
desde volumen con doce decimales. Sin errores de ejecución observados.

Las expresiones matemáticas largas conservan desplazamiento local dentro de su
recuadro; no deben ensanchar toda la página. Las páginas impresas conservan su
escala física y no dependen del tamaño de lectura.

## Corrección de paneles extensos

La explicación geométrica ya no pertenece a la barra de controles 3D: ocupa una
sección de ancho completo debajo del visor y la ficha breve. Medidas y cálculos,
así como las actividades, también ocupan secciones inferiores de ancho completo.
El visor mantiene una altura independiente del contenido de las fórmulas.

El diedro se explica en pasos cortos mediante el valor auxiliar t; no requiere
leer una fracción vectorial extensa dentro de una columna estrecha. Se revisan
las propiedades activadas (diedro, ángulo poliedro, distancias y diagonales), no
solo el estado inicial sin explicación abierta.

Se verificó la nueva distribución entre 320 y 1440 píxeles, con lectura normal
y aula, activando diedro, ángulo poliedro, distancia y diagonales. La fórmula
del diedro no presentó desplazamiento horizontal en estas comprobaciones.
Se comprobó también ocultar/mostrar el panel, volver de 2D a 3D y conservar la
arista al entrar en Medidas y regresar. La cámara ahora adapta su distancia al
redimensionar incluso después de seleccionar un ángulo, conservando el zoom
relativo y la orientación.

## Pantalla completa y zoom de conjugados

Se sustituyeron las colocaciones heredadas por áreas explícitas de cuadrícula,
sin solapamientos entre colección, visor, ficha, explicación y calculadora.
Se probó entrar y salir de pantalla completa real en Edge a 320, 390, 768,
1024, 1180, 1280, 1366 y 1920 píxeles, con lectura normal y aula: sin
intersecciones entre secciones ni desbordamiento horizontal detectados.

Los gráficos de conjugados y triedros tienen botones de ampliar y reducir,
porcentaje de zoom y centrado. «Enfocar conjugado» encuadra el dual solo,
especialmente útil para el tetraedro inscrito. Se comprobó el zoom de 100 a
125 %, su conservación al redimensionar y el regreso a 100 % al centrar.

## Prioridad visual del sólido

Los controles esenciales vuelven a una columna lateral compacta de 190 px.
Otras longitudes, conjugados e instrucciones ocupan una franja inferior propia.
El visor de escritorio dispone de 540 a 800 px de altura; en pantallas estrechas
la figura aparece antes que los controles. Se comprobaron 320, 390, 600, 768,
920, 1280, 1440 y 1920 px, en lectura normal y aula, con los bloques secundarios
debajo del visor y sin desbordamiento horizontal. Se probaron zoom, selección
de longitudes, explicación, panel ocultable, cambio 2D/3D y pantalla completa.

## Controles independientes del panel

Los controles de 3D y 2D se encuentran en la cabecera del visor, fuera de los
paneles ocultables. La cabecera cambia el grupo de controles según la vista:
zoom, centrado, rotación automática y pantalla completa para 3D; desplazamiento,
giro, zoom, centrado, plegado, progreso y pantalla completa para 2D.
Se conserva la adaptación en varias filas en ventanas pequeñas.

## Portal de sólidos geométricos

La ruta sin fragmento abre Inicio, con accesos independientes a Poliedros,
Cuerpos redondos y Ángulos en el espacio. Las rutas anteriores siguen válidas.
El módulo de cuerpos redondos incluye cilindro recto, cono recto y esfera:
modelos 3D, zoom, giro, centrado y pantalla completa; radio y altura editables;
secciones horizontales, áreas, volumen, fórmulas KaTeX y sustitución; cálculo
inverso del radio desde diámetro, perímetro, área de base o volumen según el
cuerpo. En cono/cilindro el volumen usa la altura como segundo dato.

Los desarrollos son esquemas de estudio, no plantillas a escala física. La
esfera muestra la explicación de por qué no admite desarrollo plano exacto.
No se alteró el taller imprimible de poliedros.

Comprobaciones: fórmulas e inversión numérica de los tres cuerpos; controles
3D, secciones, desarrollos, pantalla completa y actividad de comparación de
volúmenes. Se conserva la arista de poliedros al cambiar de módulo. Inicio,
Ángulos y los tres cuerpos fueron revisados entre 320 y 1920 píxeles con texto
normal y aula, sin errores de ejecución ni desbordamiento horizontal detectados.

## Accesos visibles y distribución compacta

La navegación superior permanente muestra Inicio, Poliedros, Cuerpos redondos
y Ángulos en el espacio, fuera del menú que se ocultaba por reglas responsive.
La marca general es Sólidos geométricos. El menú de familias tiene separación
vertical y los bloques de Comprende y comprueba no usan alturas fijas.

Verificado en 320, 390, 768, 1024 y 1440 píxeles, con tamaño normal y aula:
pestañas visibles y activas, sin desbordamiento horizontal ni botones pegados
a los bordes del menú. Acceso a Esfera confirmado. También se comprobó la
navegación visible abriendo directamente dist/index.html mediante file://.
Sin errores JavaScript detectados durante estas pruebas.

## Cabecera compartida sin duplicados

La marca, los cuatro accesos de módulos y el desplegable Recursos y ajustes
comparten una cabecera fuera del contenido ocultable. Se retiró la segunda
navegación que se generaba en las páginas de recursos. El logo dirige a Inicio;
Poliedros abre el laboratorio. Se verificaron ambos enlaces, los cuatro módulos
y el acceso al glosario desde el desplegable en 320, 390, 768, 1024 y 1440 px,
abriendo el archivo local, sin desbordamientos ni errores JavaScript.

## Portada ilustrada

Se integró una ilustración decorativa generada con Imagegen, almacenada en
dist/assets/solidos-estudio.png junto a su prompt. La portada separa el texto
de la imagen, elimina los contenedores anidados y ofrece acceso directo al
laboratorio. Las tres tarjetas incorporan gráficos SVG con caras sombreadas,
superficies curvas y un diedro ilustrativo; no sustituyen los modelos exactos.

Verificado en el archivo local a 320, 390, 768, 1024 y 1440 px con tamaños de
texto normal y aula: sin desbordamiento horizontal ni errores de ejecución;
imagen cargada, un único h1 y accesos de ida y vuelta al laboratorio operativos.
Revisión visual de capturas completas en escritorio y móvil.

## Cuerpos redondos: desarrollo manipulable y plegado

El desarrollo utiliza ahora el mismo canvas 3D, con zoom por botones/rueda/
pellizco, arrastre para mover o girar, centrado y pantalla completa. Sus
controles permanecen fuera del gráfico. Plegar y Desplegar usan un mismo botón,
con pausa, progreso manual y tres velocidades. La animación se detiene al
cambiar de página. Se recalculan los límites geométricos y el encuadre durante
el plegado y al redimensionar el visor.

El cilindro curva un rectángulo de ancho 2πr y gira dos discos de radio r.
El cono curva un sector de radio g y ángulo 2πr/g y gira su base circular.
La esfera se aproxima por doce gajos: no se presenta como desarrollo exacto
ni como plantilla construible sin deformación. Los esquemas no añaden aún
pestañas ni escala física de impresión; no sustituyen el taller de poliedros.

Comprobados puntos de los modelos planos, intermedios y cerrados, posiciones
finitas y radios finales. Las pruebas de interfaz completan plegar/desplegar
para los tres cuerpos y revisan 320, 390, 768, 1024 y 1440 px sin desbordamiento
horizontal. Fórmulas y cálculos anteriores se conservan. Sintaxis JS validada.
Se verificó además que zoom y arrastre cambian visualmente el canvas y que la
pantalla completa abre y cierra correctamente. Sin errores JavaScript en las
pruebas finales. Capturas de los desarrollos y sólidos revisadas visualmente.

## Un único formato para las vistas

Poliedros y cuerpos redondos usan las clases compartidas viewer-header,
viewer-actions y viewer-tabs: título a la izquierda y controles/pestañas a la
derecha, con el mismo estilo y los nombres Vista 3D / Desarrollo 2D. Los
controles de plegado de cuerpos redondos se integran en esa misma cabecera.
La aclaración sobre los gajos aproximados de la esfera permanece en el visor.
Revisados ambos módulos y ambas vistas entre 320 y 1440 px: pestañas alineadas
con el borde derecho de sus controles y sin desbordamiento horizontal.

## Panel de elementos de cuerpos redondos

Añadido panel ocultable con casillas independientes. En esfera: centro, radio,
diámetro, eje/polos, ecuador, meridiano, sección, cuerda/arco, hemisferio,
casquete, zona/segmento, huso, cuña y sector. En cono/cilindro: centro de base,
radio, diámetro, altura, generatriz, eje y sección. Las regiones se representan
con superficies coloreadas y planos o límites; los segmentos tienen etiquetas.
El panel pasa debajo del gráfico hasta 800 px y las explicaciones/fórmulas
permanecen debajo, sin llenar la barra lateral. Cambiar elementos conserva la
orientación y el zoom. Se puede variar el ángulo y los planos de corte.

Comprobado: sintaxis JavaScript y valores de todas las fichas; casos conocidos
de hemisferio, huso/cuñ​a de 90°, zona y segmento completos. Fórmulas contrastadas
con MathWorld, con enlaces dentro de la página. Pendiente verificación visual
y de interacción: Edge no se ejecutó porque el sistema automático de aprobación
alcanzó su límite de uso. No se afirma QA visual de esta incorporación.

## Construcciones explícitas de regiones esféricas

Casquete/sector: eje automático, O y C, plano de corte extendido, radio del
corte ρ con medida, radio r, escuadra de perpendicularidad y cota exterior H
con líneas auxiliares. Zona: dos planos etiquetados y altura entre ellos.
Huso/cuñ​a: eje común, dos semiplanos translúcidos con límites y rótulos,
corte perpendicular al eje, trazas radiales y sector angular amarillo con
valor α actualizado. Las explicaciones describen cómo leer estas marcas.
Etiquetas de ancho adaptable para evitar truncar los valores. Sintaxis
revisada; la posición visual final de las etiquetas aún requiere QA en navegador.

## Exploración horizontal bajo el visor

La colección de elementos pasa debajo del canvas en todos los tamaños, también
en el orden del DOM para navegación por teclado. Se elimina la columna lateral.
Casillas en cuadrícula autoajustable; dos columnas en móvil y una en anchos
inferiores a 340 px. Encabezado, ayuda y botón de limpiar comparten una fila
flexible. Los ajustes activos de corte y ángulo forman una cuadrícula propia;
si no hay parámetros visibles no se reserva ese espacio. Sin alturas fijas en
el panel. Visor de ancho completo y altura responsive más contenida. El botón
de mostrar/ocultar permanece en la cabecera. Sintaxis y diff comprobados;
verificación visual pendiente por la limitación de aprobación ya registrada.

## Etiquetas de contraste alto

Las letras y medidas sobre los cuerpos redondos usan texto casi negro sobre
placa blanca opaca, borde oscuro y una pequeña marca cromática secundaria.
Su tamaño se ajusta en pantalla (30 px de altura de placa a escala normal),
independiente del zoom de cámara. Se refuerzan los segmentos con varillas
oscuras y los contornos con tinta más profunda. La textura no recibe iluminación
ni tone mapping para conservar su contraste. Sintaxis y diff comprobados;
la revisión visual de este ajuste sigue pendiente.

## Pantalla completa centrada en la figura

El botón de cuerpos redondos solicita fullscreen sobre roundFigureView, que
contiene solo cabecera de controles y canvas. El panel de elementos, texto,
fórmulas y cálculos quedan fuera del contenedor. En fullscreen el canvas llena
la fila restante del viewport sin scroll de la lección; se oculta el botón de
panel y se recalcula el encuadre al entrar/salir. Esc o el mismo control salen.
Se informa si el navegador rechaza la solicitud. Sintaxis revisada; prueba
visual de fullscreen pendiente por la limitación de aprobación registrada.

## Velocidad compartida 3D / 2D

Selector Lenta / Normal / Rápida permanente en la cabecera, fuera del grupo
ocultable de plegado. La misma selección controla giro automático 3D y plegado
2D, también en pantalla completa. No cambia el arrastre manual ni inicia la
animación al elegir velocidad. Giro calculado por tiempo, no por fotogramas.
Campo compacto dentro de la fila flexible responsive. Sintaxis JS y diff
comprobados; verificación visual pendiente.

## Encuadre reversible sin reducción acumulada

El reajuste del plegado conserva explícitamente el zoom manual y evita que
sus eventos de cámara lo reescriban. Se elimina la inercia de cámara en la
animación del desarrollo; se conserva en la vista 3D. El encuadre se calcula
con las esquinas proyectadas del volumen envolvente y un margen único del
12 %, sin cambiar de fórmula al abandonar el estado plano. Esto mantiene
una ocupación amplia y un encuadre reproducible al volver al mismo progreso.
Sintaxis y diff comprobados; pendiente prueba visual de ciclos repetidos.

## Taller imprimible de cuerpos redondos

Acceso Imprimir plegable en ambas vistas a una página propia. Reutiliza el
planificador de rotaciones, escala real y mosaicos de poliedros mediante IDs
separados. Cilindro: rectángulo, dos bases y pestañas. Cono: sector, base y
pestañas. Esfera: doce gajos sin pestañas para cinta, radio nominal y aviso de
aproximación. A4/A3/A2, A3 en dos A4 y A2 en cuatro A4, ajuste máximo o radio
exacto en cm, guía de 5 cm y descarga SVG. Convierte mm/cm/m del laboratorio.
Los eventos beforeprint se limitan a su ruta para no sobrescribir otra plantilla.
Sintaxis comprobada; impresión física y revisión visual aún pendientes.

## Pestañas visibles y gajos pegables

El desarrollo animado incorpora pestañas claras y líneas discontinuas de
doblez: dentado de bases y unión lateral del cilindro, unión lateral del cono
y dentado de su base, pestañas segmentadas en un borde de cada gajo esférico.
Las bases se separan en plano para evitar solapes. Se añadieron pestañas a la
impresión de la esfera y se retiraron cortes sobre la unión lateral del cono.
Las puntas de los gajos quedan libres; el radio de la esfera sigue siendo
nominal porque su desarrollo es aproximado. Sintaxis/diff revisados. Pendientes
QA visual de las pestañas y prueba de montaje físico; no se garantiza aún el
ajuste material de estas plantillas.

## Plegado limpio sin aros de pestañas

Las pestañas (superficie, contorno y línea de doblez) son visibles únicamente
en progreso cero. Se ocultan durante todo el plegado/desplegado y en el sólido
cerrado, reapareciendo al llegar al plano. El encuadre usa solo superficies
visibles para que los salientes ocultos no alejen la cámara. La impresión no
se modifica y conserva sus pestañas. Sintaxis/diff comprobados; QA visual
pendiente.

## Visor de cuerpos redondos más amplio

Contenido hasta 1560 px con menos padding; canvas de 72vh en escritorio
(480–820 px), alturas adaptadas en tablet y móvil. El encuadre 3D usa los
vértices reales proyectados del modelo y un margen del 12 %, en lugar de
una esfera envolvente; reserva más margen cuando hay planos y cotas activos.
Sintaxis y diff revisados. Pendiente revisión visual del encuadre ampliado.
