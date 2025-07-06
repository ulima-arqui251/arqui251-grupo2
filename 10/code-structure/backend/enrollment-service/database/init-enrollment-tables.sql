-- Script para crear tablas adicionales necesarias para Enrollment Service
-- Compatible con la estructura existente del Auth Service

USE studymate_dev;

-- La tabla users ya existe con la estructura del Auth Service
-- Verificar que tenemos usuarios de prueba y crear algunos adicionales si es necesario

-- Insertar usuarios de prueba adicionales (usando la estructura existente)
INSERT IGNORE INTO `users` (
  `id`, 
  `email`, 
  `first_name`, 
  `last_name`, 
  `role`, 
  `email_verified`, 
  `is_active`
) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@studymate.com', 'Admin', 'User', 'admin', 1, 1),
('550e8400-e29b-41d4-a716-446655440001', 'instructor@studymate.com', 'John', 'Instructor', 'teacher', 1, 1),
('550e8400-e29b-41d4-a716-446655440002', 'student1@studymate.com', 'Alice', 'Student', 'student', 1, 1),
('550e8400-e29b-41d4-a716-446655440003', 'student2@studymate.com', 'Bob', 'Student', 'student', 1, 1);

-- Tabla de cursos (simplificada para enrollment) 
CREATE TABLE IF NOT EXISTS `courses` (
  `id` CHAR(36) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `instructor_id` CHAR(36),
  `is_active` BOOLEAN DEFAULT true,
  `max_capacity` INT DEFAULT 50,
  `current_enrollments` INT DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`)
);

-- Tabla de inscripciones (enrollments)
CREATE TABLE IF NOT EXISTS `enrollments` (
  `id` CHAR(36) PRIMARY KEY,
  `user_id` CHAR(36) NOT NULL,
  `course_id` CHAR(36) NOT NULL,
  `status` ENUM('pending', 'active', 'completed', 'cancelled', 'suspended') DEFAULT 'pending',
  `enrollment_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `completion_date` DATETIME NULL,
  `progress` DECIMAL(5,2) DEFAULT 0.00,
  `grade` DECIMAL(5,2) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_course` (`user_id`, `course_id`)
);

-- Tabla de lista de espera (waitlist)
CREATE TABLE IF NOT EXISTS `waitlists` (
  `id` CHAR(36) PRIMARY KEY,
  `user_id` CHAR(36) NOT NULL,
  `course_id` CHAR(36) NOT NULL,
  `position` INT NOT NULL,
  `status` ENUM('waiting', 'notified', 'enrolled', 'expired') DEFAULT 'waiting',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_course_waitlist` (`user_id`, `course_id`)
);

-- Insertar cursos de prueba
INSERT IGNORE INTO `courses` (
  `id`, 
  `title`, 
  `description`, 
  `instructor_id`, 
  `max_capacity`
) VALUES
('550e8400-e29b-41d4-a716-446655440100', 'JavaScript Fundamentals', 'Learn the basics of JavaScript programming', '550e8400-e29b-41d4-a716-446655440001', 30),
('550e8400-e29b-41d4-a716-446655440101', 'React Development', 'Build modern web apps with React', '550e8400-e29b-41d4-a716-446655440001', 25),
('550e8400-e29b-41d4-a716-446655440102', 'Node.js Backend', 'Server-side development with Node.js', '550e8400-e29b-41d4-a716-446655440001', 20);

-- Verificar que las tablas se crearon correctamente
SELECT 'Enrollment tables created successfully' as status;
SELECT 'Users count:' as info, COUNT(*) as count FROM users;
SELECT 'Courses count:' as info, COUNT(*) as count FROM courses;
SELECT 'Enrollments count:' as info, COUNT(*) as count FROM enrollments;
SELECT 'Waitlists count:' as info, COUNT(*) as count FROM waitlists;
