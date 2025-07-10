# Gestión de Configuración de Infraestructura con Ansible

## 1. Desarrollo Conceptual

La gestión de configuración de infraestructura es un enfoque que permite el mantenimiento automatizado de los servidores, redes, sistemas, aplicaciones y otros recursos. En lugar de configurar manualmente cada componente, se utiliza **infraestructura como código (IaC)** para garantizar consistencia, rapidez y control sobre los entornos; manteniéndolos actualizados y configuramos de manera homogénea.

### ¿Por qué es importante?

- Evita errores humanos en entornos complejos.
- Permite reproducir configuraciones en múltiples servidores o entornos (desarrollo, staging, producción).
- Facilita la escalabilidad, automatización y mantenimiento.
- Es clave en flujos DevOps y despliegues continuos.

### Herramientas populares de gestión de configuración

- **Ansible** (simple, sin agentes, muy usado en entornos DevOps).
- **Puppet** (ampliamente adoptado en entornos empresariales).
- **Chef** (flexible y con gran comunidad, aunque más complejo).
- Otras: SaltStack, CFEngine, Terraform (aunque más enfocado a aprovisionamiento).

### ¿Qué es Ansible?

Ansible es una herramienta open source que permite automatizar tareas de configuración, instalación y orquestación de servicios. Utiliza archivos en formato YAML llamados _playbooks_, que describen paso a paso lo que debe hacerse en uno o varios servidores.

### Limitaciones

- Requiere conocimientos previos de entornos Linux y SSH.
- Una mala configuración puede propagarse rápidamente.
- Para proyectos muy grandes, puede requerir integración con otras herramientas.

### Casos prácticos

- Configurar automáticamente un clúster de servidores web (por ejemplo, instalar NGINX y copiar archivos).
- Instalar software necesario para desarrolladores en nuevas máquinas.
- Actualizar configuraciones de seguridad en cientos de servidores con un solo comando.

## 2. Contexto de Solución

### Escenario

Imaginemos una pequeña empresa de desarrollo web que trabaja con múltiples entornos para su aplicación: desarrollo, pruebas (QA), staging y producción. Cada entorno se ejecuta en servidores distintos que deben mantener la misma configuración para evitar errores de compatibilidad y facilitar el despliegue continuo.

Actualmente, el equipo técnico configura manualmente cada servidor. Esto genera problemas como:

- Pérdida de tiempo en tareas repetitivas.
- Inconsistencias entre entornos.
- Riesgo de errores humanos al instalar software o mover archivos.

### Solución propuesta

Para solucionar estos problemas, se propone implementar **Ansible** como herramienta de gestión de configuración. Con esta solución, se podrá:

- Automatizar la instalación de servicios como NGINX, Node.js y Git.
- Asegurar que todos los entornos tengan las mismas versiones de software.
- Personalizar configuraciones mediante archivos YAML que se pueden versionar con Git.
- Reducir el tiempo de preparación de entornos nuevos de horas a minutos.

### Justificación

Ansible es ideal para este caso porque:

- No requiere instalar agentes en los servidores (usa SSH).
- Tiene una sintaxis simple y legible (YAML).
- Se puede ejecutar desde una laptop o servidor de control central.
- Escala fácilmente si la empresa crece y necesita más servidores.

Con esta implementación, la empresa podrá enfocarse más en el desarrollo de software y menos en la gestión manual de su infraestructura.

## 3. Consideraciones Técnicas

En esta sección se describen los pasos necesarios para instalar y configurar Ansible, así como la estructura básica de archivos para automatizar la instalación y configuración de software en uno o más servidores.

### Requisitos previos

- Sistema operativo: Ubuntu 20.04 o superior (para el equipo administrador).
- Acceso SSH a los servidores destino.
- Python instalado en los servidores.
- Conexión de red entre el equipo administrador y los servidores.

> **Nota:**
> Para pruebas locales, es posible simular los servidores usando máquinas virtuales o contenedores Docker con SSH habilitado.

### Instalación de Ansible (en el equipo controlador)

```bash
sudo apt update
sudo apt install ansible -y
```

### Crear un archivo de inventario (lista de servidores)

Archivo: hosts.ini

```bash
[web]
192.168.1.101
192.168.1.102
```

### Comprobación de conectividad

```bash
ansible -i hosts.ini web -m ping
```

Si todo está bien configurado (SSH, permisos), los servidores responderán con "pong".

### Estructura básica del proyecto

```bash
proyecto-ansible/
│
├── hosts.ini
├── install-nginx.yml
└── files/
    └── index.html
```

### Primer Playbook de ejemplo

Archivo: install-nginx.yml

```bash
- name: Configurar servidor web
  hosts: web
  become: yes
  tasks:

    - name: Instalar NGINX
      apt:
        name: nginx
        state: latest

    - name: Copiar página de inicio personalizada
      copy:
        src: files/index.html
        dest: /var/www/html/index.html
```

### Ejecución del playbook

```bash
ansible-playbook -i hosts.ini install-nginx.yml
```

Este comando ejecutará todas las tareas en todos los servidores definidos en el grupo [web].
