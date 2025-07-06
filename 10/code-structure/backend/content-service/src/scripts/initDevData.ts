import { Sequelize } from 'sequelize';
import { initModels, Category } from '../models';

/**
 * Script para inicializar datos de desarrollo
 */
async function initializeDevData() {
  try {
    console.log('🔄 Inicializando datos de desarrollo...');

    // Crear instancia de sequelize
    const sequelize = new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'studymate_content',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      logging: console.log
    });

    // Inicializar modelos
    initModels(sequelize);

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada');

    // Crear categorías por defecto
    const defaultCategories = [
      { 
        name: 'Programación', 
        description: 'Cursos de desarrollo de software',
        slug: 'programacion',
        isActive: true
      },
      { 
        name: 'Diseño', 
        description: 'Cursos de diseño gráfico y UX/UI',
        slug: 'diseno',
        isActive: true
      },
      { 
        name: 'Marketing', 
        description: 'Cursos de marketing digital',
        slug: 'marketing',
        isActive: true
      },
      { 
        name: 'Negocios', 
        description: 'Cursos de administración y negocios',
        slug: 'negocios',
        isActive: true
      },
      { 
        name: 'Idiomas', 
        description: 'Cursos de idiomas extranjeros',
        slug: 'idiomas',
        isActive: true
      },
      { 
        name: 'Ciencias', 
        description: 'Cursos de ciencias naturales y exactas',
        slug: 'ciencias',
        isActive: true
      }
    ];

    for (const categoryData of defaultCategories) {
      await Category.create(categoryData);
    }

    console.log('✅ Categorías por defecto creadas');
    console.log('🎉 Datos de desarrollo inicializados exitosamente');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando datos:', error);
    process.exit(1);
  }
}

initializeDevData();
