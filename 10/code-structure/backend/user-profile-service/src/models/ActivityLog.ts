import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { ActivityLog as IActivityLog } from '../types';

interface ActivityLogCreationAttributes extends Optional<IActivityLog, 'id' | 'timestamp'> {}

class ActivityLog extends Model<IActivityLog, ActivityLogCreationAttributes> implements IActivityLog {
  public id!: string;
  public userId!: string;
  public action!: string;
  public description!: string;
  public metadata?: Record<string, any>;
  public readonly timestamp!: Date;

  public static async logActivity(
    userId: string,
    action: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<ActivityLog> {
    return await this.create({
      userId,
      action,
      description,
      metadata,
      timestamp: new Date()
    });
  }

  public static async getUserActivity(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ActivityLog[]> {
    return await this.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit,
      offset
    });
  }
}

ActivityLog.init(
  {
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
      }
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100],
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255],
        notEmpty: true
      }
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
  },
  {
    sequelize,
    tableName: 'activity_logs',
    modelName: 'ActivityLog',
    timestamps: false,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['action']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['userId', 'timestamp']
      }
    ]
  }
);

export default ActivityLog;
