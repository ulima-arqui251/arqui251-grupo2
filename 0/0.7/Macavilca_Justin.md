### **Macavilca Justin - Stress Testing**

### Desarrollo Conceptual

Las pruebas de estrés son un método de evaluación que se utiliza para determinar la estabilidad y resistencia de un sistema, infraestructura o entidad ante escenarios extremos. Tiene como objetivo identificar puntos débiles y evaluar la capacidad de respuesta y recuperación ante situaciones de crisis. Se trata de una simulación de escenarios que podrían ocurrir en producción: múltiples usuarios conectándose al mismo tiempo, solicitudes masivas a una API, consulta simultaneas a una base de datos o interacción concurrente con recursos compartidos. Las pruebas de estrés son una herramienta para evaluar la resiliencia de diversos sistemas y entidades, permitiendo tomar medidas preventivas para mitigar posibles riesgos.

### Objetivo de Stress Testing
Las pruebas de estrés tienen como propósito evaluar los limites de funcionamiento de la aplicación bajo carga extrema, identificando posibles puntos débiles o cuello de botella que puedan causar fallos de rendimiento. Optimiza el rendimiento identificando áreas de mejora en la aplicación, como la asignación de recursos, la gestión de errores o la optimización del código, para mejorar su rendimiento bajo carga extrema. Evalúa como la aplicación se comporta ante fallos de estrés, y si dispone de mecanismo de recuperación para volver a un estado de funcionamiento normal.

### ¿Por qué realizar pruebas de estrés? 
Las pruebas de estrés permiten simular estas condiciones extremas para validar no solo la estabilidad del sistema central, sino también la eficacia de los componentes externos que lo respaldan. Estas pruebas ayudan a verificar que los balanceadores de carga estén correctamente configurados para distribuir el tráfico de manera equitativa entre los servidores disponibles. Además, permiten observar el comportamiento de los servidores de bases de datos frente a múltiples consultas simultáneas, un escenario común en aplicaciones transaccionales o educativas con alta concurrencia. También se evalúan las políticas de escalado automático, muy comunes en entornos cloud, las cuales deberían activarse de manera oportuna al detectar picos en el uso de recursos.
Otro aspecto clave que se somete a prueba es el funcionamiento de los sistemas de caché, que deben responder con eficiencia bajo presión para evitar cuellos de botella. Finalmente, se verifica la respuesta de las integraciones con servicios externos, que en situaciones de alta concurrencia pueden generar errores si no están correctamente manejadas. 

### Casos prácticos 
Las pruebas de estrés son aplicables a una gran variedad de sistemas, especialmente en aquellos que deben soportar altos niveles de concurrencia y tráfico en momentos críticos. Por ejemplo, en el caso de las aplicaciones educativas, es fundamental validar el comportamiento del sistema cuando miles de estudiantes acceden simultáneamente a un simulacro de examen o interactúan en foros durante fechas clave, como evaluaciones  o eventos académicos masivos. Asimismo, se debe verificar que las APIs del sistema respondan adecuadamente en condiciones de alta demanda.
En el sector de E-commerce, este tipo de pruebas es esencial durante campañas de alto tráfico como Cyber Days o Black Friday, donde miles de usuarios realizan búsquedas, agregan productos al carrito y finalizan compras al mismo tiempo. Además, promociones de tiempo limitado pueden generar picos de consultas a las bases de datos, lo que puede saturar los servicios si no están preparados adecuadamente.
En el ámbito financiero, aplicaciones bancarias o fintech requieren una validación estricta de sus procesos en fechas sensibles, como fines de mes o días de pago, donde los picos en transferencias, autenticaciones y consultas de saldo son significativamente mayores. Estas pruebas permiten simular la concurrencia de múltiples usuarios utilizando servicios críticos de manera simultánea.
Por otro lado, las aplicaciones móviles, como juegos en línea o redes sociales, también se benefician enormemente del stress testing. En estos casos, es común que miles de usuarios generen eventos en tiempo real —como mensajes, movimientos en un mapa, compras dentro de la app, entre otros— y se espera que el sistema pueda procesarlos sin fallos. Además, el lanzamiento de nuevas funcionalidades o versiones puede atraer a una gran base de usuarios en poco tiempo, por lo que es fundamental asegurar que la aplicación se mantenga estable ante esos incrementos repentinos de tráfico.

### Pasos para descargar e instalar Apache JMeter

- Abre un navegador de preferencia.
- Escribe en el buscador: “JMeter descarga” y accede al sitio web oficial de Apache JMeter.
- En la página principal, dirígete al apartado de descargas y haz clic en el enlace de la versión más reciente. En este caso, selecciona el archivo apache-jmeter-5.6.3.zip 
- JMeter requiere tener instalado Java versión 8 o superior. Si no cuentas con esta versión, abre una nueva pestaña, busca “descargar Java 8” y selecciona la opción que prefieras para descargar e instalar. Si ya tienes Java 8 o superior instalado, este paso no es necesario.
- Una vez finalizada la descarga del archivo .zip, descomprímelo en una ubicación de tu preferencia.
- Accede a la carpeta descomprimida y entra al subdirectorio bin. Busca el archivo jmeter
Es recomendable iniciar JMeter desde la línea de comandos en lugar de hacer doble clic sobre el archivo, ya que esto permite visualizar posibles errores en caso de que el programa falle, especialmente al simular una gran cantidad de usuarios.

