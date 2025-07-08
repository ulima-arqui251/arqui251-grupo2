# Análisis Comparativo de Frameworks Frontend Modernos: React vs Vue vs Angular vs Svelte

![comparacion](/assets/frameworks.webp)

## Introducción

En el panorama actual del desarrollo web frontend, la elección del framework correcto se ha convertido en una decisión crítica que puede determinar el éxito o fracaso de un proyecto. Los desarrolladores se enfrentan a una amplia gama de opciones, cada una con sus propias filosofías, fortalezas y casos de uso ideales. Este ensayo presenta un análisis exhaustivo de cuatro de los frameworks más influyentes del ecosistema frontend moderno: React, Vue.js, Angular y Svelte.

La evolución del desarrollo web ha llevado a los desarrolladores a enfrentar desafíos cada vez más complejos: la gestión del estado en aplicaciones de gran escala, la optimización del rendimiento, la mantenibilidad del código, y la necesidad de crear experiencias de usuario fluidas y responsivas. Cada framework aborda estos desafíos desde perspectivas diferentes, ofreciendo soluciones únicas que reflejan las distintas filosofías de diseño y arquitectura.

## Contexto y Problemática

### Los Desafíos del Desarrollo Frontend Moderno

Antes de adentrarnos en el análisis específico de cada framework, es fundamental comprender los problemas que estos intentan resolver. El desarrollo frontend moderno se caracteriza por aplicaciones cada vez más complejas, con requisitos de interactividad que van mucho más allá de las páginas web estáticas tradicionales.

**La Complejidad de la Manipulación del DOM** representa uno de los mayores desafíos. La gestión manual del Document Object Model (DOM) es propensa a errores, especialmente en aplicaciones con múltiples componentes que interactúan entre sí. Los desarrolladores necesitan herramientas que abstraigan esta complejidad mientras mantienen un control preciso sobre el comportamiento de la aplicación.

**La Gestión del Estado** se vuelve exponencialmente más compleja a medida que las aplicaciones crecen. Coordinar el estado entre múltiples componentes, manejar las actualizaciones asíncronas y mantener la consistencia de los datos son tareas que requieren arquitecturas robustas y patrones bien definidos.

**La Reutilización y Modularidad del Código** son esenciales para mantener la productividad del desarrollo y la mantenibilidad a largo plazo. Los frameworks modernos deben facilitar la creación de componentes reutilizables que puedan ser combinados de manera flexible para construir interfaces complejas.

**El Rendimiento y la Experiencia del Usuario** son aspectos críticos que impactan directamente en el éxito de las aplicaciones web. Los frameworks deben optimizar las actualizaciones del DOM, minimizar el tamaño de los bundles JavaScript y proporcionar experiencias fluidas incluso en dispositivos con recursos limitados.

## React: La Revolución del Paradigma Declarativo

![React](/assets/React.jpg)

### Filosofía y Arquitectura

React, desarrollado por Facebook (ahora Meta) en 2013, revolucionó el desarrollo frontend al introducir un paradigma completamente declarativo basado en componentes. Su filosofía central se basa en la idea de que la interfaz de usuario debe ser una función del estado de la aplicación, eliminando la necesidad de manipular el DOM manualmente.

La **arquitectura basada en componentes** de React encapsula tanto la lógica como la presentación en unidades reutilizables y autocontenidas. Esta aproximación facilita la composición de interfaces complejas a partir de componentes más simples, promoviendo la reutilización del código y mejorando la testabilidad.

El **Virtual DOM** representa una de las innovaciones más significativas de React. Esta abstracción del DOM real permite a React realizar un seguimiento eficiente de los cambios en el estado de la aplicación y aplicar solo las actualizaciones necesarias al DOM real, mejorando significativamente el rendimiento de las aplicaciones dinámicas.

### Fortalezas y Casos de Uso

React destaca particularmente en **aplicaciones web complejas** como las desarrolladas por Facebook, Netflix, Airbnb y WhatsApp Web. Su ecosistema maduro y la gran comunidad de desarrolladores lo convierten en una opción ideal para proyectos que requieren una amplia variedad de librerías y herramientas especializadas.

En el ámbito **empresarial**, React ha demostrado su valor en aplicaciones como dashboards de Atlassian, Microsoft Office 365 y Salesforce Lightning. Su capacidad para manejar aplicaciones con múltiples usuarios, roles complejos y grandes volúmenes de datos lo posiciona como una excelente opción para sistemas empresariales críticos.

El **ecosistema de React Native** extiende las capacidades de React al desarrollo móvil, permitiendo a los desarrolladores reutilizar sus conocimientos y, en algunos casos, código para crear aplicaciones nativas para iOS y Android. Aplicaciones como Instagram, Uber Eats y Discord han aprovechado exitosamente esta ventaja.

### Consideraciones y Limitaciones

Sin embargo, React no está exento de desafíos. Su **curva de aprendizaje** puede ser pronunciada para desarrolladores que provienen de paradigmas más tradicionales, especialmente cuando se introducen conceptos como JSX, hooks y el manejo del estado con Context API o bibliotecas externas como Redux.

El **tamaño del bundle** también puede ser una consideración importante, especialmente en aplicaciones donde el rendimiento de carga inicial es crítico. Aunque React ha mejorado significativamente en este aspecto con las versiones más recientes, sigue siendo más pesado que alternativas como Svelte.

## Vue.js: El Enfoque Progresivo y Pragmático

![Vue](/assets/Vue.png)

### Filosofía del Framework Progresivo

Vue.js, creado por Evan You en 2014, adopta una filosofía fundamentalmente diferente con su enfoque "progresivo". Esta característica permite a los desarrolladores adoptar Vue gradualmente, desde simples mejoras en páginas existentes hasta aplicaciones de página única completamente desarrolladas con Vue.

La **sintaxis de plantillas** de Vue está diseñada para ser intuitiva y familiar para desarrolladores que provienen de HTML, CSS y JavaScript tradicionales. Esta aproximación reduce significativamente la barrera de entrada, permitiendo a los desarrolladores comenzar a ser productivos rápidamente sin necesidad de aprender sintaxis completamente nuevas como JSX.

El **sistema de reactividad** de Vue, especialmente en su versión 3 con el uso de Proxies, proporciona una experiencia de desarrollo excepcional donde los cambios en los datos se reflejan automáticamente en la interfaz de usuario sin necesidad de configuración adicional.

### Ecosistema Oficial y Cohesión

Una de las ventajas distintivas de Vue es su **ecosistema oficial cohesivo**. Herramientas como Vue Router para el enrutamiento, Pinia para la gestión del estado, y Vue CLI/Vite para las herramientas de construcción están desarrolladas y mantenidas por el equipo central de Vue, garantizando una integración perfecta y una experiencia de desarrollo consistente.

**Nuxt.js**, el meta-framework de Vue, proporciona capacidades de renderizado del lado del servidor (SSR) y generación de sitios estáticos (SSG) que rivalizan con las mejores opciones disponibles en el ecosistema de React. Esto hace de Vue una opción atractiva para proyectos que requieren optimización SEO o rendimiento de carga inicial superior.

### Casos de Uso y Adopción

Vue ha encontrado un nicho particular en **proyectos de mediana complejidad** donde se requiere un balance entre funcionalidad y simplicidad. Aplicaciones como GitLab (que migró gradualmente desde jQuery), Adobe Portfolio y el portal de servicio al cliente de Nintendo demuestran la capacidad de Vue para manejar aplicaciones de producción a gran escala.

El framework es especialmente popular para **migración gradual de aplicaciones legacy**. Su capacidad para coexistir con código jQuery o PHP existente permite a las organizaciones modernizar sus aplicaciones sin necesidad de reescrituras completas, reduciendo el riesgo y el costo de los proyectos de modernización.

## Angular: La Plataforma Empresarial Completa

![Angular](/assets/Angular.png)

### Arquitectura Empresarial

Angular, mantenido por Google, representa una filosofía fundamentalmente diferente: en lugar de ser simplemente un framework, Angular es una **plataforma completa** para el desarrollo de aplicaciones web empresariales. Esta aproximación incluye todo lo necesario para desarrollar, probar y desplegar aplicaciones complejas desde el primer día.

La **arquitectura opinionada** de Angular, aunque puede parecer restrictiva inicialmente, proporciona beneficios significativos en proyectos grandes con múltiples desarrolladores. Los patrones establecidos como la separación entre componentes, servicios y módulos, junto con el sistema de inyección de dependencias, facilitan la mantenibilidad y escalabilidad del código.

**TypeScript como ciudadano de primera clase** en Angular no es solo una característica añadida, sino una parte fundamental de la filosofía del framework. Esto proporciona beneficios inmediatos en términos de detección temprana de errores, mejor soporte de IDEs y refactoring más seguro.

### Herramientas Integradas y Experiencia de Desarrollo

El **Angular CLI** es una de las herramientas más poderosas en el ecosistema de frameworks frontend. Proporciona capacidades de scaffolding, construcción, testing y despliegue que están profundamente integradas con el ecosistema Angular, reduciendo significativamente el tiempo de configuración inicial y mantenimiento de herramientas.

El **sistema de formularios reactivos** de Angular proporciona una solución robusta para el manejo de formularios complejos con validación avanzada, algo que es especialmente valioso en aplicaciones empresariales donde la integridad de los datos es crítica.

### Casos de Uso Empresariales

Angular brilla en **aplicaciones empresariales complejas** como sistemas ERP, CRM y plataformas de banca digital. Empresas como Deutsche Bank, ING Bank y Wells Fargo han elegido Angular para sus interfaces críticas, aprovechando su robustez, características de seguridad y soporte a largo plazo.

El **Angular Universal** para renderizado del lado del servidor, junto con el soporte nativo para Progressive Web Apps (PWAs), hace de Angular una opción sólida para aplicaciones que requieren optimización SEO y capacidades offline.

### Consideraciones de Adopción

Sin embargo, Angular viene con una **curva de aprendizaje pronunciada** y un **tamaño de bundle inicial significativo**. Estos factores pueden hacer que sea excesivo para proyectos simples o equipos pequeños que priorizan la rapidez de desarrollo sobre la estructura arquitectónica.

## Svelte: La Revolución del Tiempo de Compilación

![Svelte](/assets/svelte.png)

### Paradigma Innovador

Svelte, creado por Rich Harris, representa un cambio fundamental en la filosofía de los frameworks frontend. En lugar de incluir un runtime framework en el bundle final, Svelte **compila los componentes a JavaScript vanilla** altamente optimizado, eliminando la necesidad de un Virtual DOM y reduciendo significativamente el tamaño final de la aplicación.

Esta aproximación de **compilación en tiempo de construcción** permite optimizaciones que son imposibles en frameworks que operan en tiempo de ejecución. Svelte puede analizar el código completo de la aplicación durante la compilación y generar código JavaScript específico para cada caso de uso, eliminando código muerto y optimizando las actualizaciones del DOM.

### Simplicidad y Performance

La **sintaxis de Svelte** está diseñada para ser lo más cercana posible a HTML, CSS y JavaScript vanilla, reduciendo la carga cognitiva de los desarrolladores. Características como la reactividad declarativa con `$:` y el CSS con alcance automático proporcionan una experiencia de desarrollo fluida sin abstracciones complejas.

En términos de **rendimiento**, Svelte consistentemente supera a otros frameworks en benchmarks de velocidad y tamaño de bundle. Aplicaciones desarrolladas con Svelte típicamente tienen tiempos de carga inicial más rápidos y un uso de memoria más eficiente, especialmente en dispositivos móviles.

### Casos de Uso y Adopción

Svelte ha encontrado adopción en **aplicaciones donde el rendimiento es crítico** y el tamaño del bundle es una preocupación principal. The New York Times utiliza Svelte para sus gráficos interactivos, aprovechando su capacidad para crear visualizaciones fluidas con código mínimo.

**SvelteKit**, el meta-framework oficial de Svelte, proporciona capacidades de aplicación completa que rivalizan con Next.js y Nuxt.js, pero con un enfoque en la simplicidad y el rendimiento que es característico de Svelte.

### Limitaciones del Ecosistema

El principal desafío de Svelte es su **ecosistema relativamente pequeño**. Aunque la calidad de las bibliotecas disponibles es generalmente alta, los desarrolladores pueden encontrar menos opciones para necesidades específicas comparado con ecosistemas más maduros como React o Vue.

## Análisis Comparativo Integral

### Rendimiento y Métricas Técnicas

Al evaluar el rendimiento de estos frameworks, emergen patrones claros que reflejan sus diferentes filosofías arquitectónicas:

**Svelte** lidera consistentemente en métricas de rendimiento puro, con tiempos de First Contentful Paint (FCP) de aproximadamente 0.8 segundos y bundles que comienzan en apenas 10KB. Su enfoque de compilación elimina el overhead de runtime, resultando en aplicaciones que se ejecutan más cerca del rendimiento de JavaScript vanilla.

**Vue.js** ocupa un lugar destacado en el balance entre rendimiento y funcionalidad, con un FCP de aproximadamente 1.0 segundos y bundles que comienzan en 35KB. Su sistema de reactividad granular permite actualizaciones eficientes sin el overhead completo de un Virtual DOM.

**React** ha mejorado significativamente con las versiones recientes, especialmente con las características concurrentes de React 18. Sin embargo, mantiene un FCP de 1.2 segundos y bundles que comienzan en 45KB, reflejando su naturaleza como una biblioteca completa con un ecosistema extenso.

**Angular** presenta el mayor overhead inicial con un FCP de 1.5 segundos y bundles que comienzan en 150KB, pero esta inversión inicial se justifica en aplicaciones complejas donde sus herramientas integradas y arquitectura estructurada proporcionan beneficios de desarrollo significativos.

### Curva de Aprendizaje y Productividad del Desarrollador

La **curva de aprendizaje** varía significativamente entre frameworks, impactando directamente en la productividad del equipo y los costos de proyecto:

**Svelte** ofrece la curva de aprendizaje más suave, con desarrolladores típicamente alcanzando productividad en 2-4 semanas. Su sintaxis cercana a HTML/CSS/JS vanilla y conceptos simples como la reactividad declarativa hacen que sea intuitivo para desarrolladores de todos los niveles.

**Vue.js** mantiene una curva de aprendizaje amigable, requiriendo típicamente 3-6 semanas para alcanzar proficiencia. Su enfoque progresivo permite a los desarrolladores adoptar características avanzadas gradualmente, mientras que la sintaxis de plantillas es familiar para aquellos con experiencia en HTML.

**React** presenta una curva de aprendizaje media, requiriendo 6-10 semanas para dominar conceptos como JSX, hooks, y patrones de gestión del estado. Sin embargo, la abundancia de recursos de aprendizaje y la gran comunidad mitigan esta complejidad.

**Angular** tiene la curva de aprendizaje más pronunciada, requiriendo típicamente 10-16 semanas para alcanzar proficiencia completa. La necesidad de dominar TypeScript, el sistema de inyección de dependencias, RxJS y numerosos conceptos específicos de Angular hace que sea más desafiante para nuevos desarrolladores.

### Ecosistema y Soporte Comunitario

El **ecosistema** de cada framework refleja su madurez y adopción en la industria:

**React** posee el ecosistema más extenso con más de 95,000 paquetes relacionados en npm. Esta abundancia proporciona soluciones para prácticamente cualquier necesidad, pero también puede resultar en fatiga de decisión y fragmentación de estándares.

**Angular** mantiene un ecosistema más curado con aproximadamente 15,000 paquetes específicos, pero compensado por herramientas oficiales robustas y integración empresarial. El respaldo de Google proporciona estabilidad y desarrollo continuo.

**Vue.js** equilibra con aproximadamente 25,000 paquetes y un ecosistema oficial cohesivo. La calidad generalmente alta de las bibliotecas disponibles y la excelente documentación en múltiples idiomas hacen que sea atractivo para equipos internacionales.

**Svelte** tiene el ecosistema más pequeño con aproximadamente 5,000 paquetes, pero está creciendo rápidamente. La calidad de las bibliotecas disponibles tiende a ser alta, reflejando la naturaleza selectiva de la comunidad Svelte.

## Recomendaciones Estratégicas por Contexto

### Para Startups y Desarrollo Ágil

En el contexto de **startups y MVPs**, la velocidad de desarrollo y la capacidad de iterar rápidamente son críticas. **Vue.js** emerge como la opción más equilibrada, proporcionando una curva de aprendizaje suave, documentación excelente y un ecosistema que permite desarrollo rápido sin sacrificar la escalabilidad futura.

**Svelte** es una opción atractiva para equipos pequeños que priorizan el rendimiento y la simplicidad, especialmente en aplicaciones donde el tamaño del bundle es crítico, como aplicaciones móviles web o sitios con audiencias en regiones con conectividad limitada.

**React** mantiene su atractivo para startups que planean escalar rápidamente y necesitan acceso al mayor pool de desarrolladores disponibles, aunque esto viene con el costo de una configuración inicial más compleja.

### Para Aplicaciones Empresariales

En el contexto **empresarial**, donde la mantenibilidad a largo plazo, la escalabilidad y la integración con sistemas existentes son prioritarias, **Angular** se destaca como la opción más robusta. Su arquitectura opinionada, herramientas integradas y soporte de TypeScript proporcionan las bases sólidas necesarias para proyectos de gran escala.

**React** también es una opción viable para aplicaciones empresariales, especialmente cuando se requiere flexibilidad en la arquitectura o integración con sistemas diversos. Su ecosistema extenso proporciona soluciones para prácticamente cualquier requisito empresarial.

### Para Optimización de Rendimiento

Cuando el **rendimiento es la prioridad absoluta**, **Svelte** es la opción clara. Su enfoque de compilación y ausencia de runtime overhead lo hacen ideal para aplicaciones que necesitan ejecutarse eficientemente en dispositivos con recursos limitados.

**Vue.js** proporciona un excelente balance entre rendimiento y funcionalidad, siendo especialmente eficaz en aplicaciones donde se requiere tanto buen rendimiento como un ecosistema robusto.

## Tendencias Futuras y Evolución

### Convergencia de Paradigmas

La evolución reciente de estos frameworks muestra una tendencia hacia la **convergencia de paradigmas**. React está adoptando características de compilación con Server Components, Vue está explorando optimizaciones de tiempo de compilación con Vapor Mode, y Angular está simplificando su modelo de reactividad con Signals.

Esta convergencia sugiere que los frameworks futuros combinarán las mejores características de cada aproximación: la simplicidad de Svelte, la flexibilidad de React, la coherencia de Vue y la robustez de Angular.

### Impacto de las Nuevas Tecnologías

Las tecnologías emergentes como **WebAssembly**, **HTTP/3**, y **Edge Computing** están influyendo en la evolución de los frameworks frontend. Los frameworks que puedan adaptarse efectivamente a estas tecnologías mantendrán su relevancia en el ecosistema web futuro.

**Server-Side Rendering** y **Static Site Generation** continúan ganando importancia, con todos los frameworks principales invirtiendo significativamente en meta-frameworks que proporcionan estas capacidades.

## Conclusiones y Recomendaciones Finales

### Principios de Selección

La elección del framework correcto debe basarse en una evaluación cuidadosa de múltiples factores:

1. **Complejidad y escala del proyecto**: Proyectos simples se benefician de Svelte o Vue, mientras que aplicaciones complejas pueden justificar Angular o React.

2. **Experiencia y tamaño del equipo**: Equipos pequeños pueden maximizar la productividad con Vue o Svelte, mientras que equipos grandes pueden beneficiarse de las estructuras opinionadas de Angular.

3. **Requisitos de rendimiento**: Aplicaciones con requisitos de rendimiento estrictos deben considerar Svelte como primera opción.

4. **Consideraciones de ecosistema**: Proyectos que requieren integración con muchas bibliotecas externas se benefician del ecosistema extenso de React.

5. **Horizonte temporal**: Proyectos a largo plazo deben considerar la estabilidad y el soporte continuo que proporcionan frameworks respaldados por grandes corporaciones.

### Reflexión Final

No existe un "framework perfecto" que sea ideal para todos los casos de uso. Cada opción analizada en este ensayo tiene sus fortalezas distintivas y casos de uso óptimos. La clave del éxito radica en entender profundamente los requisitos específicos del proyecto y seleccionar la herramienta que mejor se alinee con esos objetivos.

El ecosistema de frameworks frontend continúa evolucionando rápidamente, con nuevas innovaciones que desafían constantemente las asunciones establecidas. Los desarrolladores exitosos son aquellos que mantienen una mentalidad abierta y continúan aprendiendo, adaptándose a las nuevas tecnologías mientras mantienen un enfoque pragmático en la resolución de problemas reales.

En última instancia, el valor de cualquier framework se mide no por sus características técnicas aisladas, sino por su capacidad para facilitar la creación de aplicaciones que proporcionen valor real a los usuarios finales. Este debe ser el criterio fundamental en cualquier proceso de selección de tecnología.

---

# Documentación Técnica - Demos de Frameworks Frontend

## Requisitos Previos

### Software Necesario
```bash
# Node.js (versión 18 o superior)
# Verificar instalación
node --version
npm --version

# Git (opcional pero recomendado)
git --version
```

### Puertos Utilizados
- **React**: http://localhost:3000
- **Vue**: http://localhost:3001  
- **Angular**: http://localhost:3002
- **Svelte**: http://localhost:5174

## Ejecución Rápida de Demos Existentes

### React Demo
```powershell
cd demos\react-demo
npm install
npm run dev
```

### Vue Demo  
```powershell
cd demos\vue-demo
npm install
npm run dev
```

### Angular Demo
```powershell
cd demos\angular-demo
npm install
npm start
```

### Svelte Demo
```powershell
cd demos\svelte-demo
npm install
npm run dev
```


# Creación de Demos desde Cero

## 1. Demo React + Vite + TypeScript

### Paso 1: Inicializar Proyecto
```bash
# Crear proyecto con Vite
npm create vite@latest react-todo-demo -- --template react-ts
cd react-todo-demo
```

### Paso 2: Configurar package.json
```json
{
  "name": "react-todo-demo",
  "version": "1.0.0",
  "description": "Demo de aplicación Todo con React 18",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx,ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

### Paso 3: Configurar vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
})
```

### Paso 4: Estructura de Carpetas
```
src/
  components/
    TodoForm.jsx
    TodoItem.jsx
    TodoList.jsx
    FilterButtons.jsx
    Stats.jsx
  App.jsx
  App.css
  index.css
  main.jsx
```

### Paso 5: Instalar y Ejecutar
```bash
npm install
npm run dev
```

---

## 2. Demo Vue 3 + Vite + TypeScript

### Paso 1: Inicializar Proyecto
```bash
# Crear proyecto con Vite
npm create vue@latest vue-todo-demo
# Seleccionar: TypeScript (Sí), otras opciones (No)
cd vue-todo-demo
```

### Paso 2: Configurar package.json
```json
{
  "name": "vue-todo-demo",
  "version": "1.0.0",
  "description": "Demo de aplicación Todo con Vue 3",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.4"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.2.3",
    "@vue/tsconfig": "^0.4.0",
    "typescript": "^5.0.4",
    "vue-tsc": "^1.8.5",
    "vite": "^4.4.5"
  }
}
```

### Paso 3: Configurar vite.config.js
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
  },
})
```

### Paso 4: Estructura de Carpetas
```
src/
  components/
    TodoForm.vue
    TodoItem.vue
    TodoList.vue
    FilterButtons.vue
    TodoStats.vue
  App.vue
  main.js
  style.css
```

### Paso 5: Instalar y Ejecutar
```bash
npm install
npm run dev
```

---

## 3. Demo Angular 17 + TypeScript

### Paso 1: Instalar Angular CLI
```bash
# Instalar Angular CLI globalmente
npm install -g @angular/cli@17

# Verificar instalación
ng version
```

### Paso 2: Crear Proyecto
```bash
# Crear nuevo proyecto
ng new angular-todo-demo --routing=false --style=css --standalone=true
cd angular-todo-demo
```

### Paso 3: Configurar package.json (se genera automáticamente)
```json
{
  "name": "angular-todo-demo",
  "version": "1.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve --port 3002",
    "build": "ng build",
    "serve": "ng serve --port 3002"
  },
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/compiler": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/platform-browser-dynamic": "^17.0.0",
    "@angular/router": "^17.0.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^17.0.0",
    "@angular/cli": "^17.0.0",
    "@angular/compiler-cli": "^17.0.0",
    "typescript": "~5.2.0"
  }
}
```

### Paso 4: Generar Componentes
```bash
# Generar componentes standalone
ng generate component components/todo-form --standalone
ng generate component components/todo-item --standalone  
ng generate component components/todo-list --standalone
ng generate component components/filter-buttons --standalone
ng generate component components/todo-stats --standalone

# Generar servicio
ng generate service services/todo

# Generar modelo
ng generate interface models/todo
```

### Paso 5: Estructura de Carpetas
```
src/app/
  components/
    todo-form/
    todo-item/
    todo-list/
    filter-buttons/
    todo-stats/
  models/
    todo.model.ts
  services/
    todo.service.ts
  app.component.ts
  app.component.css
```

### Paso 6: Ejecutar
```bash
npm start
# o
ng serve --port 3002
```

---

## 4. Demo Svelte + Vite + TypeScript

### Paso 1: Crear Proyecto
```bash
# Crear proyecto con template oficial
npm create svelte@latest svelte-todo-demo
# Seleccionar: Skeleton project, TypeScript (Sí), otras opciones según preferencia
cd svelte-todo-demo
```

### Paso 2: Configurar package.json
```json
{
  "name": "svelte-todo-demo",
  "version": "1.0.0",
  "description": "Demo funcional de Svelte con aplicación Todo",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-check --tsconfig ./tsconfig.json"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "@tsconfig/svelte": "^5.0.0",
    "svelte": "^4.0.0",
    "svelte-check": "^3.6.0",
    "tslib": "^2.6.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

### Paso 3: Configurar vite.config.js
```javascript
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5174,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### Paso 4: Estructura de Carpetas
```
src/
  components/
    TodoForm.svelte
    TodoItem.svelte
    TodoList.svelte
    FilterButtons.svelte
    TodoStats.svelte
  stores.ts
  types.ts
  App.svelte
  app.css
  main.ts
```

### Paso 5: Instalar y Ejecutar
```bash
npm install
npm run dev
```

---

# Funcionalidades Implementadas en Cada Demo

## Características Comunes
- Agregar nuevas tareas
- Marcar tareas como completadas
- Eliminar tareas
- Filtrar tareas (Todas, Activas, Completadas)
- Contador de tareas activas
- Interfaz responsive
- Animaciones y transiciones
- Persistencia en localStorage (opcional)

## Tecnologías Específicas por Framework

### React
- **Hooks**: useState, useEffect
- **Gestión de Estado**: Context API o estado local
- **Styling**: CSS Modules o Styled Components
- **Build**: Vite con HMR

### Vue
- **Composition API**: ref, reactive, computed
- **Reactividad**: Sistema reactivo de Vue 3
- **Styling**: Scoped CSS
- **Build**: Vite con HMR

### Angular
- **Signals**: Para reactividad moderna
- **Standalone Components**: Sin módulos
- **Services**: Inyección de dependencias
- **Build**: Angular CLI con Webpack

### Svelte
- **Stores**: Para gestión de estado global
- **Reactividad**: Compilador reactivo
- **Animations**: Transiciones integradas
- **Build**: Vite con plugin Svelte

---

# Comandos de Desarrollo

## Comandos Generales
```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build
npm run preview
```

## Comandos Específicos

### Angular
```bash
# Generar componente
ng generate component nombre-componente

# Generar servicio  
ng generate service nombre-servicio

# Servir aplicación
ng serve --port 3002
```

### Todos los Frameworks
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Actualizar dependencias
npm update
```

---

# Solución de Problemas Comunes

## Error de Puertos
```bash
# Si el puerto está ocupado, cambiar en vite.config.js
# o usar puerto específico:
npm run dev -- --port 3003
```

## Problemas de TypeScript
```bash
# Verificar configuración en tsconfig.json
# Reinstalar tipos si es necesario:
npm install --save-dev @types/node
```

## Problemas de Build
```bash
# Limpiar caché
npm run build --clean

# Para Angular:
ng build --configuration development
```
