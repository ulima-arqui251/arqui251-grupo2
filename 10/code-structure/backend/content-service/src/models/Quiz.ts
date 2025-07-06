import { DataTypes, Model, Sequelize } from 'sequelize';
import { QuizAttributes, QuizCreationAttributes } from '../types';

export class Quiz extends Model<QuizAttributes, QuizCreationAttributes> implements QuizAttributes {
  public id!: string;
  public lessonId?: string;
  public courseId?: string;
  public title!: string;
  public description?: string;
  public instructions?: string;
  public timeLimit?: number;
  public passingScore?: number;
  public maxAttempts?: number;
  public shuffleQuestions!: boolean;
  public showCorrectAnswers!: boolean;
  public isGraded!: boolean;
  public orderIndex?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    // Quiz belongs to Lesson (optional)
    Quiz.belongsTo(models.Lesson, {
      foreignKey: 'lessonId',
      as: 'lesson'
    });

    // Quiz belongs to Course (optional)
    Quiz.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });

    // Quiz has many Questions
    Quiz.hasMany(models.Question, {
      foreignKey: 'quizId',
      as: 'questions',
      onDelete: 'CASCADE'
    });

    // Quiz has many Attempts
    Quiz.hasMany(models.QuizAttempt, {
      foreignKey: 'quizId',
      as: 'attempts',
      onDelete: 'CASCADE'
    });
  }
}

export const initQuiz = (sequelize: Sequelize): typeof Quiz => {
  Quiz.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lessonId: {
        type: DataTypes.UUID,
        allowNull: true,
        validate: {
          isUUID: 4
        }
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: true,
        validate: {
          isUUID: 4
        }
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 255]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 1000]
        }
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 2000]
        }
      },
      timeLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1
        }
      },
      passingScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
          max: 100
        }
      },
      maxAttempts: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1
        }
      },
      shuffleQuestions: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      showCorrectAnswers: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isGraded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'Quiz',
      tableName: 'quizzes',
      timestamps: true,
      indexes: [
        {
          fields: ['lessonId']
        },
        {
          fields: ['courseId']
        },
        {
          fields: ['isGraded']
        },
        {
          fields: ['createdAt']
        }
      ],
      validate: {
        // Ensure quiz belongs to either lesson or course
        belongsToLessonOrCourse() {
          if (!this.lessonId && !this.courseId) {
            throw new Error('Quiz must belong to either a lesson or a course');
          }
        }
      },
      hooks: {
        beforeCreate: async (quiz: Quiz) => {
          // Set default order index if not provided
          if (quiz.orderIndex === undefined) {
            let maxOrder: number;
            
            if (quiz.lessonId) {
              maxOrder = await Quiz.max('orderIndex', {
                where: { lessonId: quiz.lessonId }
              }) as number;
            } else if (quiz.courseId) {
              maxOrder = await Quiz.max('orderIndex', {
                where: { 
                  courseId: quiz.courseId, 
                  lessonId: null as any
                }
              }) as number;
            } else {
              maxOrder = 0;
            }
            
            quiz.orderIndex = (maxOrder || 0) + 1;
          }
        },
        beforeUpdate: async (quiz: Quiz) => {
          // Validate passing score is set for graded quizzes
          if (quiz.isGraded && quiz.passingScore === undefined) {
            throw new Error('Passing score is required for graded quizzes');
          }
        }
      }
    }
  );

  return Quiz;
};
