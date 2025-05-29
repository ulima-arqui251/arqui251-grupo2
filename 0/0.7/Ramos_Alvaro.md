# Procesamiento de Lenguaje Natural (NLP) - NLTK

## Introducción:

Es un rama de la Inteligracia Artificial que se encarga de entender y procesar lenguaje humano con ayuda de la computación. Este rama se encuentra en Chatbots, asistentes virtuales, traducción automática, al resumir textos, etc.
Como limitaciones, encontramos que en modelos básicos no se direferencia lo que es ironía, bromas, sarcaso o referencia; además que el lenguaje humao contiene mucha ambiguedad, lo que puede confundir a la hora de procesar le lenguaje. Esto se puede mejorar, pero para poder hacerlo se requere un gran voumen de datos y un alto costo de recursos.
En casos prácticos, podemos encontrar que esta tecnología no ayudaría a detectar spam, detectar sentimientos, generar recomendaciones en base a diversos textos, etc.

## Contexto de Solución:

Para este caso, usaremos un call center como ejemplo. Supongamos que esta empresa recibe muchas quejas y consultas últimamente; así que se decide usar NLP poder clasificar los mensajes en: quejas, consultas, sugerencias, etc. De esta manera, se logra reducir la carga de los empleados y se ahorra muchísimo tiempo, de tal manera que los empleados puedan atender los mensajes de acuerdo a su prioridad o área.

## Consideraciones técnicas:

NLTK es una librería de código abierto para Python, así a continuación se nombrarán los pasos para poder importar la librería:

1. Abrimos una nueva terminal e ingresarmos la siguiente línea de comando:

   !pip install nltk

De esta forma estaríamos instalando las dependencias de la librería NLTK.

2. Bastaría importar la librería con la función:

   import nltk

Adicional a esto, se pueden descargar funciones como: "punkt" para separar el texto en palabras o "stopwords" para borrar preposiciones como "a", "del", etc. Estas herramientas se pueden añadir de la siguiente manera:

    nltk.download('punkt')
    nltk.download('stopwords')

## Demo

from nltk.sentiment import SentimentIntensityAnalyzer
import nltk

nltk.download('vader_lexicon')

analisis = SentimentIntensityAnalyzer()

texto = input("Escribe un mensaje cualquiera: ")
puntuacion = analisis.polarity_scores(texto)

if puntuacion['compound'] >= 0.05:
print("Sentimiento positivo")
elif puntuacion['compound'] <= -0.05:
print("Sentimiento negativo")
else:
print("Sentimiento neutro")
