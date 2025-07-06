import { DataTypes, Model, Sequelize } from 'sequelize';
import { LessonProgressAttributes, LessonProgressCreationAttributes } from '../types';

export class LessonProgress extends Model<LessonProgressAttributes, LessonProgressCreationAttributes> implements LessonProgressAttributes {
  public id!: string;
  public lessonId!: string;
  public studentId!: string;
  public courseId!: string;
  public isCompleted!: boolean;
  public completedAt?: Date;
  public timeSpent?: number;
  public lastAccessedAt?: Date;
  public progress!: number;

  // Associations
  public static associate(models: any) {
    // Progress belongs to Lesson
    LessonProgress.belongsTo(models.Lesson, {
      foreignKey: 'lessonId',
      as: 'lesson'
    });

    // Progress belongs to Course
    LessonProgress.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });

    // Progress belongs to User (will be referenced from User service)
    // LessonProgress.belongsTo(models.User, {
    //   foreignKey: 'studentId',
    //   as: 'student'
    // });
  }
}

export const initLessonProgress = (sequelize: Sequelize): typeof LessonProgress => {
  LessonProgress.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lessonId: {
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
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notEmpty: true,
          isUUID: 4
        }
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      timeSpent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      lastAccessedAt: {
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
      }
    },
    {
      sequelize,
      modelName: 'LessonProgress',
      tableName: 'lesson_progress',
      timestamps: false, // We use custom date fields
      indexes: [
        {
          fields: ['lessonId']
        },
        {
          fields: ['studentId']
        },
        {
          fields: ['courseId']
        },
        {
          fields: ['lessonId', 'studentId'],
          unique: true
        },
        {
          fields: ['isCompleted']
        },
        {
          fields: ['progress']
        },
        {
          fields: ['lastAccessedAt']
        }
      ],
      validate: {
        // Validate completion consistency
        validateCompletion(this: LessonProgress) {
          if (this.isCompleted && this.progress < 100) {
            throw new Error('Lesson cannot be marked as completed with progress less than 100%');
          }
          if (this.completedAt && !this.isCompleted) {
            throw new Error('Lesson cannot have completion date without being marked as completed');
          }
        }
      },
      hooks: {
        beforeUpdate: async (progress: LessonProgress) => {
          // Update last accessed time on any update
          progress.lastAccessedAt = new Date();
          
          // Set completed date when lesson is completed
          if (progress.isCompleted && progress.progress === 100 && !progress.completedAt) {
            progress.completedAt = new Date();
          }
          
          // Clear completed date if lesson is marked as incomplete
          if (!progress.isCompleted) {
            progress.completedAt = undefined;
          }
          
          // Auto-complete lesson if progress reaches 100%
          if (progress.progress === 100 && !progress.isCompleted) {
            progress.isCompleted = true;
            progress.completedAt = new Date();
          }
        },
        beforeCreate: async (progress: LessonProgress) => {
          // Set initial last accessed time
          progress.lastAccessedAt = new Date();
          
          // Auto-complete if progress is 100%
          if (progress.progress === 100) {
            progress.isCompleted = true;
            progress.completedAt = new Date();
          }
        }
      }
    }
  );

  return LessonProgress;
};
