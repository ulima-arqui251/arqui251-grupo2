import { DataTypes, Model, Sequelize } from 'sequelize';
import { QuizAttemptAttributes, QuizAttemptCreationAttributes, QuizAnswer } from '../types';

export class QuizAttempt extends Model<QuizAttemptAttributes, QuizAttemptCreationAttributes> implements QuizAttemptAttributes {
  public id!: string;
  public quizId!: string;
  public studentId!: string;
  public courseId!: string;
  public startedAt!: Date;
  public completedAt?: Date;
  public score?: number;
  public totalQuestions!: number;
  public correctAnswers!: number;
  public answers!: QuizAnswer[];
  public isPassed!: boolean;
  public attemptNumber!: number;
  public timeSpent?: number;

  // Associations
  public static associate(models: any) {
    // Attempt belongs to Quiz
    QuizAttempt.belongsTo(models.Quiz, {
      foreignKey: 'quizId',
      as: 'quiz'
    });

    // Attempt belongs to Course
    QuizAttempt.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });

    // Attempt belongs to User (will be referenced from User service)
    // QuizAttempt.belongsTo(models.User, {
    //   foreignKey: 'studentId',
    //   as: 'student'
    // });
  }
}

export const initQuizAttempt = (sequelize: Sequelize): typeof QuizAttempt => {
  QuizAttempt.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      quizId: {
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
      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
          max: 100
        }
      },
      totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      correctAnswers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      answers: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      isPassed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      attemptNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      timeSpent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0
        }
      }
    },
    {
      sequelize,
      modelName: 'QuizAttempt',
      tableName: 'quiz_attempts',
      timestamps: false, // We use custom date fields
      indexes: [
        {
          fields: ['quizId']
        },
        {
          fields: ['studentId']
        },
        {
          fields: ['courseId']
        },
        {
          fields: ['quizId', 'studentId', 'attemptNumber'],
          unique: true
        },
        {
          fields: ['isPassed']
        },
        {
          fields: ['score']
        },
        {
          fields: ['startedAt']
        },
        {
          fields: ['completedAt']
        }
      ],
      validate: {
        // Validate score consistency
        validateScore(this: QuizAttempt) {
          if (this.completedAt && this.score === undefined) {
            throw new Error('Completed quiz attempt must have a score');
          }
          if (this.correctAnswers > this.totalQuestions) {
            throw new Error('Correct answers cannot exceed total questions');
          }
        }
      },
      hooks: {
        beforeCreate: async (attempt: QuizAttempt) => {
          // Set attempt number if not provided
          if (!attempt.attemptNumber) {
            const maxAttempt = await QuizAttempt.max('attemptNumber', {
              where: { 
                quizId: attempt.quizId,
                studentId: attempt.studentId
              }
            }) as number;
            attempt.attemptNumber = (maxAttempt || 0) + 1;
          }
        },
        beforeUpdate: async (attempt: QuizAttempt) => {
          // Calculate score when attempt is completed
          if (attempt.completedAt && !attempt.score) {
            attempt.score = Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100);
          }
          
          // Calculate time spent when completed
          if (attempt.completedAt && !attempt.timeSpent) {
            const timeDiff = new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime();
            attempt.timeSpent = Math.round(timeDiff / (1000 * 60)); // Convert to minutes
          }
        }
      }
    }
  );

  return QuizAttempt;
};
