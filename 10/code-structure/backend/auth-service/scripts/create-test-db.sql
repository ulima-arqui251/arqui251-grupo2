-- Script para crear base de datos de test para StudyMate
-- Ejecutar desde mysql como root

-- Crear base de datos de test si no existe
CREATE DATABASE IF NOT EXISTS studymate_test 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Otorgar permisos al usuario studymate para la base de datos de test
GRANT ALL PRIVILEGES ON studymate_test.* TO 'studymate'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Mostrar bases de datos para verificar
SHOW DATABASES;

-- Verificar permisos
SHOW GRANTS FOR 'studymate'@'localhost';
