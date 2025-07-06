import { DataTypes, Model, Op } from 'sequelize';
import sequelize from './database';
import { EnrollmentStatus } from '../types';

class EnrollmentHistory extends Model {
  declare id: string;
  declare enrollmentId: string;
  declare previousStatus: EnrollmentStatus | null;
  declare newStatus: EnrollmentStatus;
  declare reason: string | null;
  declare changedBy: string;
  declare changedAt: Date;
  declare notes: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;

  // Static methods
  static async logStatusChange(
    enrollmentId: string,
    previousStatus: EnrollmentStatus | null,
    newStatus: EnrollmentStatus,
    changedBy: string,
    reason?: string,
    notes?: string
  ): Promise<EnrollmentHistory> {
    return this.create({
      enrollmentId,
      previousStatus,
      newStatus,
      reason,
      changedBy,
      changedAt: new Date(),
      notes
    });
  }

  static async getEnrollmentHistory(enrollmentId: string): Promise<EnrollmentHistory[]> {
    return this.findAll({
      where: { enrollmentId },
      order: [['changedAt', 'DESC']]
    });
  }

  static async getUserEnrollmentHistory(userId: string): Promise<EnrollmentHistory[]> {
    return this.findAll({
      include: [{
        model: sequelize.models.Enrollment,
        where: { userId }
      }],
      order: [['changedAt', 'DESC']]
    });
  }

  static async getRecentStatusChanges(days = 7): Promise<EnrollmentHistory[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return this.findAll({
      where: {
        changedAt: {
          [Op.gte]: dateThreshold
        }
      },
      order: [['changedAt', 'DESC']]
    });
  }

  static async getStatusChangeStats(courseId?: string) {
    const includeClause = courseId ? [{
      model: sequelize.models.Enrollment,
      where: { courseId }
    }] : [];

    const results = await this.findAll({
      attributes: [
        'newStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      include: includeClause,
      group: ['newStatus']
    });

    return results.reduce((acc, result) => {
      acc[result.newStatus] = parseInt(result.get('count') as string);
      return acc;
    }, {} as Record<string, number>);
  }
}

EnrollmentHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    enrollmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'enrollments',
        key: 'id'
      }
    },
    previousStatus: {
      type: DataTypes.ENUM(...Object.values(EnrollmentStatus)),
      allowNull: true  // Para inscripciones nuevas, no hay estado previo
    },
    newStatus: {
      type: DataTypes.ENUM(...Object.values(EnrollmentStatus)),
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    changedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    changedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'EnrollmentHistory',
    tableName: 'enrollment_history',
    indexes: [
      {
        fields: ['enrollmentId']
      },
      {
        fields: ['changedBy']
      },
      {
        fields: ['changedAt']
      },
      {
        fields: ['newStatus']
      },
      {
        fields: ['previousStatus']
      }
    ]
  }
);

export default EnrollmentHistory;
