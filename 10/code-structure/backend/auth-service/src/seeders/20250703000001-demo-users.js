'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 12;
    
    // Crear usuarios de prueba para cada rol
    const users = [
      {
        id: uuidv4(),
        email: 'estudiante@studymate.com',
        password_hash: await bcrypt.hash('password123', saltRounds),
        first_name: 'Juan',
        last_name: 'Pérez',
        role: 'student',
        email_verified: true,
        two_factor_enabled: false,
        login_attempts: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        email: 'profesor@studymate.com',
        password_hash: await bcrypt.hash('password123', saltRounds),
        first_name: 'María',
        last_name: 'González',
        role: 'teacher',
        email_verified: true,
        two_factor_enabled: false,
        login_attempts: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        email: 'admin@studymate.com',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        first_name: 'Carlos',
        last_name: 'Rodríguez',
        role: 'admin',
        email_verified: true,
        two_factor_enabled: true,
        login_attempts: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        email: 'soporte@studymate.com',
        password_hash: await bcrypt.hash('support123', saltRounds),
        first_name: 'Ana',
        last_name: 'López',
        role: 'support',
        email_verified: true,
        two_factor_enabled: false,
        login_attempts: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Usuario para testing de Google OAuth (sin password)
      {
        id: uuidv4(),
        email: 'google.user@gmail.com',
        password_hash: null,
        first_name: 'Google',
        last_name: 'User',
        role: 'student',
        email_verified: true,
        google_id: 'google_test_id_123456',
        two_factor_enabled: false,
        login_attempts: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
    
    console.log('✅ Usuarios de prueba creados:');
    console.log('📧 estudiante@studymate.com / password123 (Student)');
    console.log('📧 profesor@studymate.com / password123 (Teacher)');
    console.log('📧 admin@studymate.com / admin123 (Admin)');
    console.log('📧 soporte@studymate.com / support123 (Support)');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
