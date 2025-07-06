-- StudyMate Database Setup
-- Ejecutar estos comandos en MySQL como root

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS studymate_dev;
CREATE DATABASE IF NOT EXISTS studymate_test;

-- Crear el usuario con contraseña 12345
CREATE USER IF NOT EXISTS 'studymate'@'localhost' IDENTIFIED BY '12345';

-- Otorgar permisos completos
GRANT ALL PRIVILEGES ON studymate_dev.* TO 'studymate'@'localhost';
GRANT ALL PRIVILEGES ON studymate_test.* TO 'studymate'@'localhost';

-- Aplicar los cambios
FLUSH PRIVILEGES;

-- Verificar que el usuario fue creado
SELECT User, Host FROM mysql.user WHERE User = 'studymate';

-- Verificar las bases de datos
SHOW DATABASES LIKE 'studymate%';
