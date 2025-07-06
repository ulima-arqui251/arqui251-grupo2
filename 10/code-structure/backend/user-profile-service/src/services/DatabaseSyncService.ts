import { sequelize } from '../config/database';
import { UserProfile, ActivityLog } from '../models';

export class DatabaseSyncService {
  
  /**
   * Initialize database and create tables if they don't exist
   */
  async initializeDatabase(): Promise<void> {
    try {
      // Test the connection
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully');

      // Create database if it doesn't exist
      await this.createDatabaseIfNotExists();

      // Sync models (create tables if they don't exist)
      await this.syncModels();

      console.log('✅ Database initialization completed');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database if it doesn't exist
   */
  private async createDatabaseIfNotExists(): Promise<void> {
    try {
      const databaseName = process.env.DB_NAME || 'studymate_dev';
      
      // Create a connection without specifying the database
      const { Sequelize } = require('sequelize');
      const tempSequelize = new Sequelize({
        dialect: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '12345',
        logging: false
      });

      // Create database if it doesn't exist
      await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`);
      await tempSequelize.close();
      
      console.log(`✅ Database '${databaseName}' ensured to exist`);
    } catch (error) {
      console.error('❌ Error creating database:', error);
      // Don't throw error here, the database might already exist
    }
  }

  /**
   * Sync database models
   */
  private async syncModels(): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
        // In development, alter tables to match models
        await sequelize.sync({ alter: true });
        console.log('✅ Database models synchronized (development mode)');
      } else {
        // In production, just check if tables exist
        await sequelize.sync();
        console.log('✅ Database models synchronized (production mode)');
      }
    } catch (error) {
      console.error('❌ Error syncing models:', error);
      throw error;
    }
  }

  /**
   * Check if all required tables exist
   */
  async validateTables(): Promise<boolean> {
    try {
      const tables = ['user_profiles', 'activity_logs'];
      const queryInterface = sequelize.getQueryInterface();
      
      for (const table of tables) {
        const exists = await queryInterface.showAllTables().then(tableNames => 
          tableNames.includes(table)
        );
        
        if (!exists) {
          console.error(`❌ Table '${table}' does not exist`);
          return false;
        }
      }
      
      console.log('✅ All required tables exist');
      return true;
    } catch (error) {
      console.error('❌ Error validating tables:', error);
      return false;
    }
  }

  /**
   * Create initial data or seed data
   */
  async seedData(): Promise<void> {
    try {
      // Add any initial data here if needed
      console.log('✅ Database seeding completed');
    } catch (error) {
      console.error('❌ Error seeding data:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    try {
      await sequelize.close();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
    }
  }
}

export default new DatabaseSyncService();
