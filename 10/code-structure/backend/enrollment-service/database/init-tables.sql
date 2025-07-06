-- Script para crear tablas base necesarias para Enrollment Service
-- Ejecutar en MySQL antes de iniciar el servicio

USE studymate_dev;

-- Tabla de usuarios (simplificada para enrollment)
CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `firstName` VARCHAR(100) NOT NULL,
  `lastName` VARCHAR(100) NOT NULL,
  `role` ENUM('student', 'instructor', 'admin') DEFAULT 'student',
  `isActive` BOOLEAN DEFAULT true,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de cursos (simplificada para enrollment)
CREATE TABLE IF NOT EXISTS `courses` (
  `id` CHAR(36) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `instructorId` CHAR(36),
  `isActive` BOOLEAN DEFAULT true,
  `maxCapacity` INT DEFAULT 50,
  `currentEnrollments` INT DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`instructorId`) REFERENCES `users` (`id`)
);

-- Insertar datos de prueba
INSERT IGNORE INTO `users` (`id`, `email`, `firstName`, `lastName`, `role`) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@studymate.com', 'Admin', 'User', 'admin'),
('550e8400-e29b-41d4-a716-446655440001', 'instructor@studymate.com', 'John', 'Instructor', 'instructor'),
('550e8400-e29b-41d4-a716-446655440002', 'student1@studymate.com', 'Alice', 'Student', 'student'),
('550e8400-e29b-41d4-a716-446655440003', 'student2@studymate.com', 'Bob', 'Student', 'student');

INSERT IGNORE INTO `courses` (`id`, `title`, `description`, `instructorId`, `maxCapacity`) VALUES
('550e8400-e29b-41d4-a716-446655440100', 'JavaScript Fundamentals', 'Learn the basics of JavaScript programming', '550e8400-e29b-41d4-a716-446655440001', 30),
('550e8400-e29b-41d4-a716-446655440101', 'React Development', 'Build modern web apps with React', '550e8400-e29b-41d4-a716-446655440001', 25),
('550e8400-e29b-41d4-a716-446655440102', 'Node.js Backend', 'Server-side development with Node.js', '550e8400-e29b-41d4-a716-446655440001', 20);

-- Verificar que las tablas se crearon
SELECT 'Users table created' as status, COUNT(*) as users_count FROM users;
SELECT 'Courses table created' as status, COUNT(*) as courses_count FROM courses;
