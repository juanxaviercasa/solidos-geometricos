# Revolución y Pappus-Guldin

Nueva pestaña y página #revolucion, con enlaces desde Inicio y cuerpos redondos.
Curva/superficie y región/volumen: rectángulo, triángulo rectángulo,
semicírculo, círculo exterior (toro) y polígono simple configurable.
Eje, generatriz, centroides separados, recorrido del centroide, ángulo 0–360°,
pausa, velocidad, cámara, centrado y fullscreen. Medidas en centímetros.
Teoría, condiciones, fórmulas y sustitución KaTeX. Referencia MathWorld.
La curva de cilindro/cono genera superficie lateral, no incluye bases.
No calcula superficies arbitrarias: solo revoluciones válidas sin solapamiento.

Comprobados numéricamente superficie y volumen de cilindro, cono, esfera,
toro y región rectangular desplazada del eje. Sintaxis/diff comprobados.
Pendiente QA visual, responsive e interacción de este nuevo módulo.

## Segunda etapa didáctica

Esquema 2D con región, curva y ambos centroides, tabla comparativa con unidades,
deducción simbólica por perfil y tres pasos de resolución. Problema inverso
que calcula el ángulo y lo aplica al modelo; rechaza objetivos negativos o
superiores a una vuelta. Actividad de predicción con respuesta explicada.
Vistas frontal/superior, zoom, reinicio, transparencia y casillas para ocultar
generador o recorrido. Etiquetas eje/G/d de alto contraste en 3D.
Advertencia específica al desplazar el eje del cuerpo clásico. Contenido
responsive en cuadrículas que pasan a una columna; fullscreen reserva espacio
para el canvas y no incluye las fichas de explicación.

Sintaxis/diff comprobados. Pruebas numéricas de ángulo inverso, entradas
inválidas y desplazamiento del eje correctas. QA visual e interacción pendientes.

Etiquetas del gráfico ampliadas: placa de 36 px de altura a escala normal,
texto oscuro grande/negrita, subíndices Gₗ/Gₐ y tamaño independiente del zoom.
Respeta la escala de lectura del aula. Sintaxis comprobada; revisión visual
pendiente.

Casilla Mostrar etiquetas en los controles de observación: permite ocultar o
restaurar eje, Gₗ/Gₐ y d sin cambiar cámara, progreso ni reproducción. Su valor
se respeta al reconstruir el dibujo durante la animación. Sintaxis comprobada;
interacción visual pendiente.

Rótulos 3D en español descriptivo: Eje de giro, Distancia al eje y Centro de
la curva / Centro del área. Placas de dos líneas para evitar siglas aisladas.
La leyenda explica d, L, A y la diferencia entre centroide y centro de gravedad
(coinciden bajo densidad y gravedad uniformes). Se conservan símbolos en las
fórmulas, acompañados por sus definiciones. Sintaxis comprobada; QA visual pendiente.

Corrección: se retiran nombres completos del dibujo. Solo aparecen d, G y eje,
en placas compactas de 28 px de alto a escala normal. Casillas independientes
con explicación en español fuera del canvas. Las fórmulas y la leyenda distinguen
centroide de curva y de área; el cambio no altera cámara ni animación.
