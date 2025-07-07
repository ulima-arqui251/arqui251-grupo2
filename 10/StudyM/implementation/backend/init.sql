-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS studymate;

-- Usar la base de datos
USE studymate;

-- Crear usuario con permisos completos
CREATE USER IF NOT EXISTS 'studymate_user'@'%' IDENTIFIED BY 'studymate_password';
GRANT ALL PRIVILEGES ON studymate.* TO 'studymate_user'@'%';
FLUSH PRIVILEGES;

-- Mensaje de confirmación
SELECT 'Base de datos StudyMate creada exitosamente' AS status;
