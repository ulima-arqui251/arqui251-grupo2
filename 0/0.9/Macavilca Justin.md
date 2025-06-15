# Queue-Based Load Leveling 

## Introducción
En sistemas distribuidos y aplicaciones modernas, la gestión eficiente de la carga es crucial para garantizar la estabilidad y rendimiento. En este contexto, la combinación de herramientas como JMeter para pruebas de carga, un proxy intermediario y Kafka como sistema de mensajería permite emular escenarios reales de producción, especialmente bajo patrones como el Queue-Based Load Leveling.
El objetivo de esta práctica es diseñar un plan de prueba usando JMeter que permita generar múltiples peticiones HTTP con datos en formato JSON hacia un proxy localizado en http://localhost:3000/send. Este proxy recibe las peticiones y las reenvía como eventos a un clúster de Kafka, desacoplando así a los productores y consumidores.

## Solución
Refactorizar la solución e introducir una cola entre la tarea y el servicio. La tarea y el servicio se ejecutan de manera asincrónica. La tarea publica un mensaje que contiene los datos que necesita el servicio para una cola. La cola actúa como un búfer, almacenando el mensaje hasta que se recupera mediante el servicio. El servicio recupera los mensajes de la cola y los procesa. Las solicitudes de varias tareas, que pueden generarse a una frecuencia muy variable, pueden pasarse al servicio mediante la misma cola de mensajes. En esta figura se muestra el uso de una cola para nivelar la carga de un servicio.

![Queuesolution](/assets/queue_solución.png)

La cola desvincula las tareas del servicio, y el servicio puede controlar los mensajes a su propio ritmo independientemente del volumen de solicitudes de las tareas simultáneas. Además, no existe ningún retraso en una tarea si el servicio no está disponible en el momento en que publica un mensaje en la cola.
Este modelo proporciona las siguientes ventajas:
- Puede ayudar a maximizar la disponibilidad porque los retrasos que surgen de los servicios no tendrán un impacto directo e inmediato sobre la aplicación, que puede seguir publicando mensajes a la cola incluso cuando el servicio no está disponible o no está procesando mensajes en esos momentos.
- Puede ayudar a maximizar la escalabilidad porque el número de colas y el número de servicios puede variar para satisfacer la demanda.
- Puede ayudar a controlar los costos porque el número de instancias de servicio que se ha implementado solo tiene que ser adecuado para cumplir la carga media en lugar de la carga máxima.

## Aplicaciones que podría utilizar

- **Kafka**: Plataforma distribuida de mensajería alta velocidad diseñada para manejar flujos de datos en tiempo real. Ideal para sistemas que requieren alta tolerancia a fallos y procesamiento por lotes o en streaming.

- **RabbitMQ**: Broker de mensajes ligero y flexible, basado en el protocolo AMQP. Muy utilizado para tareas asincrónicas, colas de trabajo y sistemas que necesitan confirmaciones y reintentos.

- **AWS SQS**: Servicio de colas gestionado por Amazon Web Services. Escalable, sin servidor y fácil de integrar con otros servicios en la nube. Ideal para desacoplar microservicios o tareas batch.

## Diseño del Plan de Prueba en JMeter con Kafka

Para lograr la simulación deseada, se estructuró el plan de prueba de la siguiente manera:

### Thread Group (Grupo de Hilos)

- Nombre: Usuarios simulados
- Número de hilos (usuarios concurrentes): 100
- Loop Count (Número de iteraciones por hilo): 10
- Total de solicitudes enviadas: 100 usuarios × 10 iteraciones = 1000 solicitudes
- Ramp-Up Period: Activado opcionalmente para simular una subida gradual de la carga y evitar un pico abrupto.
Este grupo define la concurrencia y la cantidad total de peticiones que serán generadas durante la prueba.

### HTTP Request (Petición HTTP)

- **Nombre**: Enviar a Kafka vía Proxy
- **Método**: POST
- **Servidor**: localhost
- **Puerto**: 3000
- **Ruta**: /send
- **Cuerpo de la petición (Body Data) en formato JSON**: Se desactiva la opción “Use multipart/form-data” para enviar el JSON.

### HTTP Header Manager 

Para garantizar que el servidor interprete correctamente el contenido de la petición, se añade el siguiente encabezado:

**Nombre**: Content-Type
**Valor**: application/json

Este elemento se agrega al HTTP Request para especificar el tipo de contenido del cuerpo.

### Listeners 

- **Summary Report**: Para visualizar estadísticas agregadas como número de solicitudes, tiempos de respuesta y errores.
- **View Results Tree**: Para depurar y visualizar el detalle de cada petición y respuesta, muy útil durante el desarrollo o en caso de fallos.

### Pasos para crear el archivo del proyecto

Abre una terminal (CMD, PowerShell o Terminal de VS Code) en esa carpeta

Ejecuta estos comandos desde esa carpeta:

```sh
npm init -y
npm install express kafkajs
```
Esto generará automáticamente:
- package.json 
- node_modules/ 
- package-lock.json 

Luego, creas el archivo proxy-kafka.js en esa misma carpeta 

### Creamos el archivo proxy-kafka.js

```sh
const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());

const kafka = new Kafka({
  clientId: 'jmeter-proxy',
  brokers: ['localhost:9092'], 
});

const producer = kafka.producer();

(async () => {
  await producer.connect();
  console.log('Kafka Producer conectado');

  app.post('/send', async (req, res) => {
    try {
      const message = {
        value: JSON.stringify(req.body),
      };

      await producer.send({
        topic: 'stress-topic',
        messages: [message],
      });

      res.status(200).send('Mensaje enviado a Kafka');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      res.status(500).send('Error interno');
    }
  });

  app.listen(3000, () => console.log('Servidor escuchando en http://localhost:3000'));
})();
```
### Usamos el docker para implementar el programa

asegúrar de que el contenedor este corriendo y accesible desde localhost:9092

```sh
version: '2'
services:
  zookeeper:
    image: wurstmeister/zookeeper:3.4
    ports:
      - "2181:2181"
  kafka:
    image: wurstmeister/kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
```

Y lo corres con:

```sh
docker-compose up
```

### Resultado Esperado

Al ejecutar este plan de prueba, JMeter generará mil peticiones HTTP concurrentes que serán recibidas por el proxy local en el send. El proxy actuará como intermediario, enviando estos datos a Kafka como eventos. Esto permite desacoplar la generación de solicitudes de su consumo, implementando el patrón Queue-Based Load Leveling.
Kafka funcionará como una cola buffer que nivelará la carga entre el productor (JMeter/proxy) y el consumidor final, facilitando la escalabilidad y resistencia del sistema.


