import { DataTypes, Model, Sequelize } from 'sequelize';
import { QuestionAttributes, QuestionCreationAttributes, QuestionOption, QuizType } from '../types';

export class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes {
  public id!: string;
  public quizId!: string;
  public type!: QuizType;
  public question!: string;
  public explanation?: string;
  public points!: number;
  public orderIndex!: number;
  public options?: QuestionOption[];
  public correctAnswer?: string | string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    // Question belongs to Quiz
    Question.belongsTo(models.Quiz, {
      foreignKey: 'quizId',
      as: 'quiz'
    });
  }
}

export const initQuestion = (sequelize: Sequelize): typeof Question => {
  Question.init(
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
      type: {
        type: DataTypes.ENUM(...Object.values(QuizType)),
        allowNull: false
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [10, 2000]
        }
      },
      explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 1000]
        }
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 0.5,
          max: 100
        }
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      options: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      correctAnswer: {
        type: DataTypes.JSON,
        allowNull: true
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
      modelName: 'Question',
      tableName: 'questions',
      timestamps: true,
      indexes: [
        {
          fields: ['quizId']
        },
        {
          fields: ['quizId', 'orderIndex'],
          unique: true
        },
        {
          fields: ['type']
        },
        {
          fields: ['createdAt']
        }
      ],
      validate: {
        // Validate options for multiple choice questions
        validateOptions() {
          if (this.type === QuizType.MULTIPLE_CHOICE || this.type === QuizType.TRUE_FALSE) {
            if (!this.options || !Array.isArray(this.options) || this.options.length === 0) {
              throw new Error('Options are required for multiple choice and true/false questions');
            }
          }
        },
        // Validate correct answer is provided
        validateCorrectAnswer() {
          if (!this.correctAnswer) {
            throw new Error('Correct answer is required');
          }
        },
        // Validate options format for multiple choice
        validateMultipleChoiceOptions() {
          if (this.type === QuizType.MULTIPLE_CHOICE && Array.isArray(this.options)) {
            if (this.options.length < 2) {
              throw new Error('Multiple choice questions must have at least 2 options');
            }
            if (this.options.length > 10) {
              throw new Error('Multiple choice questions cannot have more than 10 options');
            }
          }
        }
      },
      hooks: {
        beforeCreate: async (question: Question) => {
          // Set default order index if not provided
          if (question.orderIndex === undefined) {
            const maxOrder = await Question.max('orderIndex', {
              where: { quizId: question.quizId }
            }) as number;
            question.orderIndex = (maxOrder || 0) + 1;
          }
        },
        beforeUpdate: async (question: Question) => {
          // Validate options and correct answer on update
          if (question.type === QuizType.MULTIPLE_CHOICE && Array.isArray(question.options)) {
            const hasValidCorrectAnswer = question.options.some((option: QuestionOption) => 
              Array.isArray(question.correctAnswer) 
                ? question.correctAnswer.includes(option.id)
                : question.correctAnswer === option.id
            );
            if (!hasValidCorrectAnswer) {
              throw new Error('Correct answer must match one of the provided options');
            }
          }
        }
      }
    }
  );

  return Question;
};
