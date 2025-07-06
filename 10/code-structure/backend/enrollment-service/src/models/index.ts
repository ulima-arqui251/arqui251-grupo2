import sequelize from './database';
import Enrollment from './Enrollment';
import CourseCapacity from './CourseCapacity';
import EnrollmentHistory from './EnrollmentHistory';
import Waitlist from './Waitlist';

// Definir asociaciones
const setupAssociations = () => {
  // Enrollment associations
  Enrollment.hasMany(EnrollmentHistory, {
    foreignKey: 'enrollmentId',
    as: 'history'
  });

  EnrollmentHistory.belongsTo(Enrollment, {
    foreignKey: 'enrollmentId',
    as: 'enrollment'
  });

  // CourseCapacity associations
  // Note: Se asume que existe un modelo Course en el Content Service
  // Aquí solo definimos la relación conceptual

  // Waitlist associations
  // Note: Se asume que existen modelos User y Course en otros servicios
};

// Configurar asociaciones
setupAssociations();

// Función para sincronizar modelos con la base de datos
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    await sequelize.sync({ force, alter: true }); // Usar alter: true para actualizar esquemas
    console.log('✅ Modelos sincronizados con la base de datos.');
    
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    return false;
  }
};

// Función para cerrar la conexión
export const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log('✅ Conexión a la base de datos cerrada.');
  } catch (error) {
    console.error('❌ Error cerrando la conexión:', error);
  }
};

// Exportar modelos y sequelize
export {
  sequelize,
  Enrollment,
  CourseCapacity,
  EnrollmentHistory,
  Waitlist
};

export default {
  sequelize,
  Enrollment,
  CourseCapacity,
  EnrollmentHistory,
  Waitlist,
  syncDatabase,
  closeDatabase
};
