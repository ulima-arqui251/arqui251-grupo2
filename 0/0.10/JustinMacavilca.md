# PRUEBAS DE REGRESIÓN VISUAL EN APLICACIONES WEB

## 1. Introducción

En el desarrollo de software, donde las aplicaciones web son actualizadas constantemente, es esencial garantizar que los cambios realizados en el código no afecten negativamente la apariencia visual de la interfaz de usuario (UI). Los usuarios esperan una experiencia visual coherente, clara y sin errores gráficos. En este contexto, las pruebas funcionales por sí solas resultan insuficientes, ya que no detectan alteraciones visuales.
Las pruebas de regresión visual sirven como una herramienta indispensable para validar que los cambios en el frontend no introduzcan desviaciones visuales inesperadas. Su implementación mejora la estabilidad, el control de calidad visual y la confianza del equipo de desarrollo al desplegar nuevas funcionalidades. Estas pruebas permiten documentar la evolución visual del software y garantizan que la interfaz conserve su integridad estética y funcional con el tiempo.

## 2. Desarrollo Conceptual

Las pruebas de regresión visual son una estrategia automatizada de calidad que compara capturas de pantalla (snapshots) entre versiones previas y actuales de una aplicación web. Estas pruebas permiten identificar diferencias inesperadas en el diseño, colores, posiciones de elementos o estilos visuales.
A diferencia de las pruebas funcionales, que verifican si el sistema hace lo que debe hacer, las pruebas de regresión visual se enfocan en la pregunta: “¿Algo que no debería haber cambiado, ha cambiado visualmente?”. Esto las convierte en una herramienta indispensable para preservar la experiencia visual del usuario, especialmente en interfaces complejas o en plataformas con alta interacción visual.

### 2.1 Objetivos de las Pruebas de Regresión Visual

Las pruebas de regresión visual tienen como finalidad garantizar que los cambios realizados en una interfaz web no afecten negativamente la apariencia visual ni la experiencia del usuario. Estas pruebas permiten automatizar la comparación de la interfaz antes y después de realizar una modificación, asegurando la estabilidad visual del sistema.

A continuación, se detallan los objetivos principales:

- Detectar cambios visuales no deseados: Identifica alteraciones en la apariencia de la interfaz que puedan haber sido introducidas de manera involuntaria durante el desarrollo, refactorización o actualización de componentes.
- Mantener la consistencia del diseño entre versiones: Asegura que los elementos visuales como botones, formularios, tipografía y disposición de contenido permanezcan intactos a través de las versiones del sistema.
- Validar el impacto visual de nuevos desarrollos o integraciones: Comprueba que las nuevas funcionalidades implementadas no afecten negativamente las secciones existentes de la interfaz desde el punto de vista visual.
- Reducir la revisión manual de interfaces: Automatiza la verificación visual, minimizando el tiempo y esfuerzo de validaciones manuales, especialmente útil en equipos ágiles o con ciclos de despliegue continuo.
- Mejorar la calidad de la experiencia de usuario (UX): Detectar errores visuales que podrían afectar la usabilidad o la percepción del sistema por parte de los usuarios finales.
- Facilitar la detección de problemas en múltiples resoluciones: Evaluar cómo se comporta visualmente la interfaz en distintos tamaños de pantalla, asegurando una correcta visualización.

Estos objetivos permiten incorporar las pruebas de regresión visual como una práctica esencial dentro de una estrategia de aseguramiento de calidad centrada en la interfaz gráfica, siendo especialmente valiosa en aplicaciones con cambios frecuentes o con un alto estándar visual.

### 2.2 ¿Por qué son importantes las pruebas de regresión visual?

- Garantizan coherencia visual: Permite verificar que el diseño de la interfaz se mantenga constante entre versiones, lo que fortalece la identidad visual de la aplicación.
- Previenen errores visuales: Se detectan desplazamientos, cambios de color o estilos que podrían perjudicar la experiencia del usuario.
- Aceleran el control de calidad: Automatiza la revisión visual que de otro modo requeriría muchos recursos humanos y tiempo.
- Facilitan la colaboración entre diseñadores y desarrolladores: Sirven como puente visual para validar la correcta implementación de los prototipos UI/UX.
- Reducen costos de corrección en producción: Al detectar errores visuales antes del despliegue, se evitan retrabajos y fallos visibles para los usuarios finales.

## 3. Contexto de Aplicación

Las pruebas de regresión visual son particularmente efectivas en proyectos con interfaces ricas, módulos compartidos y despliegues continuos. Su aplicación se justifica en:

- Aplicaciones educativas web: Validar la consistencia visual de módulos de exámenes, tableros de notas, foros estudiantiles y dashboards.
- Sistemas de ecommerce: Verificar que los productos, botones de compra y banners se visualicen correctamente tras cambios o promociones.
- Aplicaciones bancarias: Asegurar la integridad visual de formularios, flujos de pago y mensajes informativos.
- Sitios con personalización visual: Validar que temas oscuros, modos de accesibilidad o estilos corporativos no generen conflictos visuales.

Ejemplo educativo: Una plataforma virtual de aprendizaje donde cada semana se publican exámenes en línea. Una pequeña modificación en el CSS podría desplazar el botón de "Enviar respuestas", provocando errores de usabilidad. Aplicar pruebas de regresión visual en estas pantallas permite detectar estos problemas antes de que lleguen al estudiante.

## 4. DEMO

Esta demo se ejecuta en Visual Code y se crear una carpeta donde se almacenara los datos

### 4.1 Requisitos

- Node.js instalado
- NPM o Yarn
- Google Chrome(para capturas con Puppeteer)

### 4.2 Pasos para configuración:

Instalar la herramienta:

```bash
npm install -g backstopjs
```

Inicializar el proyecto:

```bash
backstop init
```

Para generar una prueba se realizara este codigo

```bash
backstop test
```

Nos mostrara un error de backstop.js al no encontrar archivos de referencias.Esto significa que no existe algun arhcivo de referencia de aquellos que se crean 

En la misma terminal, ejecutar el siguiente comando:

```bash
backstop approve
```

Este comando guardara los resultados de la prueba mas reciente como la referencia y creara el directorio.

Editar backstop.config.js con la pagina a testear: 
En este caso utilizamos la pagina de paleta de colores

```bash
{
      "label": "Paleta de colores",
      "cookiePath": "backstop_data/engine_scripts/cookies.json",
      "url": "https://monitor177.github.io/color-palette/",
      "referenceUrl": "",
      "readyEvent": "",
      "readySelector": "",
      "delay": 0,
      "hideSelectors": [],
      "removeSelectors": [],
      "hoverSelector": "",
      "clickSelector": "#generate",
      "postInteractionWait": 0,
      "selectors": [],
      "selectorExpansion": true,
      "expect": 0,
      "misMatchThreshold" : 0.1,
      "requireSameDimensions": true
    }
```
- misMatchThreshold: Nivel de tolerancia a diferencias visuales (0.1 = 10%).
- clickSelector: genera los cambios de colores que se realizaran en la aplicación. 
- requireSameDimensions: Asegura que las capturas comparadas tengan las mismas dimensiones.

Ahora ejecutar denuevo el comando backstop test para comparar las imagenes que se obtienen en esta prueba con las que obtuvo anteriormente.
Cada vez que ejecute el comando backstop test, se modificara el archivo index.html que contiene el reporte, ubicado en el directorio html_report para mostrar las nuevas imagenes y sus diferencias. Este reporte muestra cada uno de los escenarios configurados para la prueba de regresión visual.

