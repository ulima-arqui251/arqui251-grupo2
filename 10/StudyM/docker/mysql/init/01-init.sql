-- Script de inicialización para MySQL
-- Este script se ejecuta automáticamente cuando se crea el contenedor MySQL

USE studymate_db;

-- Configurar charset y collation
ALTER DATABASE studymate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario adicional para la aplicación (si no existe)
CREATE USER IF NOT EXISTS 'studymate_user'@'%' IDENTIFIED BY 'studymate_pass_2025';
GRANT ALL PRIVILEGES ON studymate_db.* TO 'studymate_user'@'%';
FLUSH PRIVILEGES;

-- Las tablas serán creadas automáticamente por Sequelize cuando la aplicación se inicie
-- Este script solo asegura que la base de datos esté configurada correctamente

SELECT 'Base de datos StudyMate inicializada correctamente' as message;
