-- Script para insertar datos de prueba en tablas existentes del Enrollment Service
-- Compatible con la estructura existente

USE studymate_dev;

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

-- Insertar cursos de prueba (usando la estructura existente)
INSERT IGNORE INTO `courses` (
  `id`, 
  `title`, 
  `description`, 
  `instructorId`, 
  `maxCapacity`
) VALUES
('550e8400-e29b-41d4-a716-446655440100', 'JavaScript Fundamentals', 'Learn the basics of JavaScript programming', '550e8400-e29b-41d4-a716-446655440001', 30),
('550e8400-e29b-41d4-a716-446655440101', 'React Development', 'Build modern web apps with React', '550e8400-e29b-41d4-a716-446655440001', 25),
('550e8400-e29b-41d4-a716-446655440102', 'Node.js Backend', 'Server-side development with Node.js', '550e8400-e29b-41d4-a716-446655440001', 20);

-- Verificar que los datos se insertaron correctamente
SELECT 'Test data inserted successfully' as status;
SELECT 'Users count:' as info, COUNT(*) as count FROM users;
SELECT 'Courses count:' as info, COUNT(*) as count FROM courses;
SELECT 'Enrollments count:' as info, COUNT(*) as count FROM enrollments;
SELECT 'Waitlists count:' as info, COUNT(*) as count FROM waitlists;
