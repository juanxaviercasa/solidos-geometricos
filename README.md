# Sólidos geométricos · Sistema Zenit

Web educativa en español para explorar geometría espacial mediante modelos 3D,
desarrollos 2D, cálculos y actividades interactivas.

## Contenido del MVP

- Poliedros platónicos, ejemplos arquimedianos y prismas configurables.
- Cilindro, cono y esfera, con referencias geométricas y animaciones.
- Ángulos en el espacio, conjugados y dualidad.
- Revolución y teoremas de Pappus‑Guldin; editor cartesiano de trazados.
- Fórmulas con KaTeX, teoría, glosario y actividades.
- Exportación PNG a color y plantillas SVG para imprimir.
- Impresión A4/A3/A2, medidas exactas y montaje automático entre varias hojas.
- Navegación responsive, tema y ajustes de lectura.

## Ejecutar

El sitio es estático y no requiere instalación ni compilación. Publica el
contenido de `dist/` en un alojamiento web estático. Para desarrollo, sirve esa
carpeta mediante un servidor HTTP local; por ejemplo, si tienes Python:

```sh
python -m http.server 8080 --directory dist
```

Abre `http://localhost:8080`. Three.js y KaTeX se cargan desde CDN, por lo que
se necesita conexión a Internet. No hay backend ni credenciales necesarias.

## Despliegue en GitHub Pages

El workflow `.github/workflows/pages.yml` publica `dist/` al enviar cambios a
`main`. En Settings → Pages, la fuente de publicación debe ser **GitHub Actions**.
El dominio personalizado configurado es `solidosgeometricos.sistemazenit.com`.

En el proveedor DNS de `sistemazenit.com`, configura el registro **CNAME** de
`solidosgeometricos` hacia `juanxaviercasa.github.io` (sin protocolo ni ruta).
El archivo `dist/CNAME` documenta ese dominio; con Actions también debe estar
registrado en Settings → Pages. Cuando el DNS y el certificado estén listos,
activa **Enforce HTTPS**. No se necesitan secretos para el workflow.

## Impresión y límites conocidos

Imprime a tamaño real (100 %), sin ajustar a página, y comprueba con una regla
la barra de 5 cm. Las plantillas de esfera por gajos son aproximadas: la esfera
no admite un desarrollo plano exacto. Las plantillas generadas, pestañas y
montajes requieren todavía validación física de recorte y armado. El generador
de redes puede advertir de solapamientos; no todas las figuras de revolución
tienen una plantilla construible.

Los documentos `revision-*.md` recogen revisiones realizadas durante el desarrollo,
pero no constituyen una certificación integral de exactitud o accesibilidad.

## Estructura

- `dist/index.html`: página de entrada.
- `dist/*.js` y `dist/*.css`: módulos y estilos de la aplicación.
- `dist/assets/`: recursos visuales y procedencia de la ilustración de portada.
- `.openai/hosting.json`: configuración del alojamiento anterior; no es necesaria
  para servir el sitio en otro proveedor.

Desarrollado por [Xavier Cabello](https://xavier.cabellosalirrosas.com).

