import { DataTypes, Model } from 'sequelize';
import sequelize from './database';
import { EnrollmentStatus, PaymentStatus } from '../types';

class Enrollment extends Model {
  declare id: string;
  declare userId: string;
  declare courseId: string;
  declare status: EnrollmentStatus;
  declare enrolledAt: Date;
  declare completedAt: Date | null;
  declare droppedAt: Date | null;
  declare cancelledAt: Date | null;
  declare progress: number;
  declare paymentStatus: PaymentStatus;
  declare paymentAmount: number | null;
  declare paymentMethod: string | null;
  declare notes: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;

  // Instance methods
  public markAsCompleted(): Promise<this> {
    return this.update({
      status: EnrollmentStatus.COMPLETED,
      completedAt: new Date(),
      progress: 100
    });
  }

  public markAsDropped(reason?: string): Promise<this> {
    return this.update({
      status: EnrollmentStatus.DROPPED,
      droppedAt: new Date(),
      notes: reason || this.notes
    });
  }

  public updateProgress(newProgress: number): Promise<this> {
    const progress = Math.max(0, Math.min(100, newProgress));
    const updateData: any = { progress };
    
    if (progress === 100 && this.status === EnrollmentStatus.ACTIVE) {
      updateData.status = EnrollmentStatus.COMPLETED;
      updateData.completedAt = new Date();
    }
    
    return this.update(updateData);
  }

  public markPaymentAsPaid(amount: number, method: string): Promise<this> {
    return this.update({
      paymentStatus: PaymentStatus.PAID,
      paymentAmount: amount,
      paymentMethod: method
    });
  }

  // Static methods
  static async findByUser(userId: string) {
    return this.findAll({
      where: { userId },
      order: [['enrolledAt', 'DESC']]
    });
  }

  static async findByCourse(courseId: string) {
    return this.findAll({
      where: { courseId },
      order: [['enrolledAt', 'DESC']]
    });
  }

  static async findActiveEnrollments() {
    return this.findAll({
      where: { status: EnrollmentStatus.ACTIVE }
    });
  }

  static async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.findOne({
      where: {
        userId,
        courseId,
        status: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED]
      }
    });
    return !!enrollment;
  }

  static async getEnrollmentStats(courseId?: string) {
    const whereClause = courseId ? { courseId } : {};
    
    const [
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      droppedEnrollments
    ] = await Promise.all([
      this.count({ where: whereClause }),
      this.count({ where: { ...whereClause, status: EnrollmentStatus.ACTIVE } }),
      this.count({ where: { ...whereClause, status: EnrollmentStatus.COMPLETED } }),
      this.count({ where: { ...whereClause, status: EnrollmentStatus.DROPPED } })
    ]);

    const progressResult = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('AVG', sequelize.col('progress')), 'averageProgress']
      ]
    });

    const revenueResult = await this.findAll({
      where: {
        ...whereClause,
        paymentStatus: PaymentStatus.PAID
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('paymentAmount')), 'totalRevenue']
      ]
    });

    return {
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      droppedEnrollments,
      averageProgress: parseFloat(progressResult[0]?.get('averageProgress') as string) || 0,
      totalRevenue: parseFloat(revenueResult[0]?.get('totalRevenue') as string) || 0
    };
  }
}

Enrollment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(EnrollmentStatus)),
      allowNull: false,
      defaultValue: EnrollmentStatus.ACTIVE
    },
    enrolledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    droppedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    progress: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    paymentStatus: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.PENDING
    },
    paymentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Enrollment',
    tableName: 'enrollments',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'courseId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['courseId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['enrolledAt']
      },
      {
        fields: ['paymentStatus']
      }
    ]
  }
);

export default Enrollment;
