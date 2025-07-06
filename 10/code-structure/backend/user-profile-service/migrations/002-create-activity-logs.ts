import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('activity_logs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('activity_logs', ['userId'], {
      name: 'activity_logs_user_id_index'
    });

    await queryInterface.addIndex('activity_logs', ['action'], {
      name: 'activity_logs_action_index'
    });

    await queryInterface.addIndex('activity_logs', ['timestamp'], {
      name: 'activity_logs_timestamp_index'
    });

    await queryInterface.addIndex('activity_logs', ['userId', 'timestamp'], {
      name: 'activity_logs_user_timestamp_index'
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('activity_logs');
  }
};
