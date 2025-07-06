import { DataTypes, Model, Sequelize } from 'sequelize';
import { CourseEnrollmentAttributes, CourseEnrollmentCreationAttributes } from '../types';

export class CourseEnrollment extends Model<CourseEnrollmentAttributes, CourseEnrollmentCreationAttributes> implements CourseEnrollmentAttributes {
  public id!: string;
  public courseId!: string;
  public studentId!: string;
  public enrolledAt!: Date;
  public completedAt?: Date;
  public progress!: number;
  public lastAccessedAt?: Date;
  public certificateUrl?: string;
  public isActive!: boolean;

  // Associations
  public static associate(models: any) {
    // Enrollment belongs to Course
    CourseEnrollment.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });

    // Enrollment belongs to User (will be referenced from User service)
    // CourseEnrollment.belongsTo(models.User, {
    //   foreignKey: 'studentId',
    //   as: 'student'
    // });
  }
}

export const initCourseEnrollment = (sequelize: Sequelize): typeof CourseEnrollment => {
  CourseEnrollment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notEmpty: true,
          isUUID: 4
        }
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notEmpty: true,
          isUUID: 4
        }
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
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      lastAccessedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      certificateUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'CourseEnrollment',
      tableName: 'course_enrollments',
      timestamps: false, // We use custom enrolledAt field
      indexes: [
        {
          fields: ['courseId']
        },
        {
          fields: ['studentId']
        },
        {
          fields: ['courseId', 'studentId'],
          unique: true
        },
        {
          fields: ['isActive']
        },
        {
          fields: ['enrolledAt']
        },
        {
          fields: ['progress']
        }
      ],
      validate: {
        // Validate completion requirements
        validateCompletion(this: CourseEnrollment) {
          if (this.completedAt && this.progress < 100) {
            throw new Error('Course cannot be marked as completed with progress less than 100%');
          }
        }
      },
      hooks: {
        beforeUpdate: async (enrollment: CourseEnrollment) => {
          // Update last accessed time on progress update
          if (enrollment.changed('progress')) {
            enrollment.lastAccessedAt = new Date();
          }
          
          // Set completed date when progress reaches 100%
          if (enrollment.progress === 100 && !enrollment.completedAt) {
            enrollment.completedAt = new Date();
          }
          
          // Clear completed date if progress drops below 100%
          if (enrollment.progress < 100 && enrollment.completedAt) {
            enrollment.completedAt = undefined;
          }
        }
      }
    }
  );

  return CourseEnrollment;
};
