
# PATRONES CLOUD: COMPENSATING TRANSACTION

![COMPENSATING](/0/0.9/img/compensating-transaction.png)

## 1. Problema

En los sistemas distribuidos modernos, particularmente en arquitecturas basadas en microservicios, es frecuente que una operación lógica esté compuesta por múltiples pasos que se ejecutan en diferentes servicios o módulos independientes. Por ejemplo, un proceso de compra en línea puede incluir: la creación de un pedido, la actualización del inventario, la emisión de una factura y el procesamiento del pago.

El problema se presenta cuando alguno de estos pasos falla por ejemplo, si el pago no puede procesarse pero las acciones anteriores ya han sido ejecutadas. Esto puede generar un estado inconsistente en el sistema, en el que, por ejemplo, se ha reducido el stock y registrado un pedido sin que el cobro haya sido exitoso.

Dado que en estos entornos no siempre es viable utilizar transacciones ACID tradicionales, se hace necesario implementar una estrategia que permita garantizar la coherencia del sistema incluso ante fallos parciales.

---

## 2. Solución

El patrón **Compensating Transaction** plantea como solución la definición de acciones compensatorias para cada operación que modifica el estado del sistema de forma irreversible. De este modo, si ocurre una falla en algún punto del proceso, estas acciones se ejecutan para revertir los efectos de los pasos previos, asegurando así la integridad del sistema.

En lugar de evitar los errores, este enfoque se enfoca en gestionar adecuadamente las fallas, aplicando mecanismos de recuperación que restauran el sistema a un estado válido. Cada acción relevante en el flujo principal debe contar con su correspondiente acción inversa, diseñada específicamente para anular sus efectos.

Este patrón es ampliamente utilizado en arquitecturas event-driven mediante mecanismos como *sagas*, y también es compatible con servicios cloud como AWS Step Functions, que permiten modelar flujos de trabajo con tareas compensatorias explícitas. Su uso no se limita a contextos de desarrollo específicos, sino que es aplicable a una gran variedad de entornos que requieren operaciones transaccionales distribuidas.

---

## 3. Casos de aplicación

A continuación se presentan escenarios representativos en los que el patrón **Compensating Transaction** se aplica de manera efectiva:

### a. Comercio electrónico

En una tienda virtual, el flujo de compra implica la creación del pedido, la deducción del stock y el procesamiento del pago. Si el pago no se concreta por algún motivo (rechazo bancario, error del sistema, etc.), deben deshacerse las operaciones anteriores. Esto implica restaurar el inventario y cancelar el pedido, asegurando que el sistema no registre ventas incompletas.

### b. Servicios financieros

En una operación de transferencia interbancaria, es fundamental que el débito y el abono se ejecuten como una unidad atómica. Si el abono no se puede completar, el sistema debe revertir automáticamente el débito aplicado. El patrón permite modelar estas compensaciones de forma explícita y controlada.

### c. Logística y transporte

Al coordinar un envío, pueden ejecutarse pasos como la asignación de vehículos, la generación de guías de despacho y la facturación del servicio. Si por algún motivo el envío no puede concretarse, es necesario liberar los recursos y anular los documentos generados. Este tipo de flujos se beneficia del uso de transacciones compensatorias para garantizar coherencia operativa.

### d. Aplicaciones empresariales (ERP/CRM)

En sistemas integrados de gestión, procesos como la aprobación de órdenes de compra, la verificación de crédito y la asignación de inventario pueden involucrar distintos módulos. Ante fallos en alguna etapa, el patrón Compensating Transaction permite revertir selectivamente las operaciones ya ejecutadas, evitando inconsistencias entre áreas del sistema.

---

## 4. Aplicación del patrón en el proyecto grupal: Study-Mate

En el desarrollo del proyecto grupal *Study-Mate*, una plataforma educativa que busca motivar el aprendizaje a través de dinámicas interactivas, gamificación y progresos personalizados, el patrón **Compensating Transaction** cobra especial importancia en aquellos flujos en los que intervienen múltiples pasos consecutivos y cuya ejecución coherente es clave para mantener la experiencia del usuario.

Un ejemplo claro se encuentra en los desafíos semanales. Cuando un estudiante completa un reto, se desencadenan acciones como el aumento del puntaje, la habilitación de un nuevo nivel y la actualización de estadísticas. Si alguna de estas operaciones por ejemplo, el guardado de estadísticas falla por un problema técnico, sería necesario revertir las acciones anteriores para evitar inconsistencias, como niveles desbloqueados sin justificación o puntuaciones incorrectas.

Aplicar este patrón en Study-Mate nos permitiría construir funciones que reviertan automáticamente el estado del sistema si ocurre un error a mitad del proceso. Así, no solo se mantiene la coherencia, sino también la equidad del sistema frente a todos los usuarios.

También es aplicable a otros casos, como la activación de suscripciones premium. Si el usuario intenta pagar y el cobro no se procesa correctamente, pero ya se activaron privilegios, el sistema debería deshacer esa asignación para evitar ofrecer beneficios no autorizados. Este tipo de control es clave tanto a nivel técnico como comercial.

En resumen, el uso del patrón **Compensating Transaction** en una plataforma como Study-Mate permite gestionar con mayor fiabilidad operaciones complejas, mejorar la experiencia del usuario y reforzar la estabilidad general del sistema, especialmente en entornos educativos donde la progresión justa y transparente es parte fundamental del valor ofrecido.


## Demo del patron Compensating Transactions

### Descripción del Proyecto

Este proyecto es un ejemplo de orquestación de flujos de trabajo (workflows) usando [Temporal](https://temporal.io/) y TypeScript. Implementa un flujo de trabajo tipo "transacción compensatoria" (compensating transaction), donde cada paso puede ser revertido si ocurre un error, simulando la preparación de un desayuno (por ejemplo: obtener un tazón, agregar cereal, agregar leche).

![DEMO1](/0/0.9/img/demo1.PNG)

---

### Estructura del Proyecto

```
typescript/
├── src/
│   ├── activities.ts      # Definición de actividades y compensaciones
│   ├── workflows.ts       # Definición de workflows principales
│   └── client.ts          # Cliente para iniciar workflows
├── package.json           # Dependencias y scripts de npm
├── tsconfig.json          # Configuración de TypeScript
├── docker-compose.yml     # Configuración de Temporal Server con Docker
├── .env                   # Variables de entorno para Docker Compose
└── README.md              # Documentación del proyecto
```

---

### Tecnologías Utilizadas

- **Temporal**: Orquestador de workflows distribuido.
- **TypeScript**: Lenguaje principal del proyecto.
- **Node.js**: Entorno de ejecución.
- **Docker**: Para levantar Temporal Server y sus dependencias.
- **PostgreSQL** y **Elasticsearch**: Usados por Temporal Server.
- **Temporal Web UI**: Interfaz gráfica para visualizar workflows.

---

### ¿Qué hace el proyecto?

- Orquesta un flujo de trabajo que simula la preparación de un desayuno.
- Implementa lógica de compensación: si alguna actividad falla, se ejecutan actividades de reversión (compensación) para deshacer los pasos previos.
- Permite ejecutar compensaciones en paralelo usando un flag especial.

![DEMO2](/0/0.9/img/demo2.PNG)

![DEMO3](/0/0.9/img/demo3.PNG)

---

## Pasos para ejecutar el proyecto

### 1. Instalar dependencias

Asegúrate de tener [Node.js](https://nodejs.org/) y [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalados.

Instala las dependencias del proyecto:

```sh
npm install
```

### 2. Levantar Temporal Server

Desde la carpeta del proyecto, asegúrate de tener los archivos `docker-compose.yml` y `.env` (con las versiones correctas).  
Luego ejecuta:

```sh
docker-compose up
```

Esto iniciará Temporal Server y sus servicios en segundo plano.

### 3. Iniciar el Worker

En otra terminal, ejecuta:

```sh
npm run start.watch
```

Esto iniciará el worker que ejecuta los workflows y actividades.

### 4. Ejecutar un Workflow

En otra terminal, ejecuta:

```sh
npm run workflow
```

Para probar la lógica de compensación en paralelo:

```sh
npm run workflow -- --parallel-compensations
```

### 5. Visualizar el flujo en la Web UI

Abre tu navegador y ve a [http://localhost:8080](http://localhost:8080)  
Aquí puedes ver el historial y estado de los workflows ejecutados.

---

## Notas adicionales

- Puedes modificar las actividades en `src/activities.ts` para forzar errores y probar la lógica de compensación.
- El namespace por defecto en Temporal es `default`.
- Los logs del worker muestran la ejecución de cada paso y las compensaciones.

---

## Referencias

- [Microsoft Azure - Compensating Transaction Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction)
- [Martin Fowler - Transaction Patterns](https://martinfowler.com/eaaCatalog/transactionScript.html)
- [Enterprise Integration Patterns - Compensating Action](https://www.enterpriseintegrationpatterns.com/patterns/messaging/CompensatingTransaction.html)
- [AWS Step Functions - Error Handling](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html)
- [Node.js Documentation](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [fs module - Node.js](https://nodejs.org/api/fs.html)
