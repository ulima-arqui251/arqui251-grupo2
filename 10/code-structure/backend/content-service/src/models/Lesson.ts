import { DataTypes, Model, Sequelize } from 'sequelize';
import { LessonAttributes, LessonCreationAttributes, LessonType } from '../types';

export class Lesson extends Model<LessonAttributes, LessonCreationAttributes> implements LessonAttributes {
  public id!: string;
  public courseId!: string;
  public title!: string;
  public description?: string;
  public type!: LessonType;
  public content?: string;
  public videoUrl?: string;
  public duration?: number;
  public orderIndex!: number;
  public isPreview!: boolean;
  public isCompleted?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    // Lesson belongs to Course
    Lesson.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });

    // Lesson has many Materials
    Lesson.hasMany(models.Material, {
      foreignKey: 'lessonId',
      as: 'materials',
      onDelete: 'CASCADE'
    });

    // Lesson has many Quizzes
    Lesson.hasMany(models.Quiz, {
      foreignKey: 'lessonId',
      as: 'quizzes',
      onDelete: 'CASCADE'
    });

    // Lesson has many Progress records
    Lesson.hasMany(models.LessonProgress, {
      foreignKey: 'lessonId',
      as: 'progress',
      onDelete: 'CASCADE'
    });
  }
}

export const initLesson = (sequelize: Sequelize): typeof Lesson => {
  Lesson.init(
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
          len: [0, 2000]
        }
      },
      type: {
        type: DataTypes.ENUM(...Object.values(LessonType)),
        allowNull: false,
        defaultValue: LessonType.TEXT
      },
      content: {
        type: DataTypes.TEXT('long'),
        allowNull: true
      },
      videoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0
        }
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      isPreview: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isCompleted: {
        type: DataTypes.VIRTUAL,
        get() {
          // This is a virtual field that will be calculated based on user's progress
          return false;
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
      modelName: 'Lesson',
      tableName: 'lessons',
      timestamps: true,
      indexes: [
        {
          fields: ['courseId']
        },
        {
          fields: ['courseId', 'orderIndex'],
          unique: true
        },
        {
          fields: ['type']
        },
        {
          fields: ['isPreview']
        },
        {
          fields: ['createdAt']
        }
      ],
      hooks: {
        beforeCreate: async (lesson: Lesson) => {
          // If orderIndex is not provided, set it to the next available index
          if (lesson.orderIndex === undefined) {
            const maxOrder = await Lesson.max('orderIndex', {
              where: { courseId: lesson.courseId }
            }) as number;
            lesson.orderIndex = (maxOrder || 0) + 1;
          }
        },
        beforeUpdate: async (lesson: Lesson) => {
          // Validate video URL is provided for video lessons
          if (lesson.type === LessonType.VIDEO && !lesson.videoUrl) {
            throw new Error('Video URL is required for video lessons');
          }
          
          // Validate content is provided for text lessons
          if (lesson.type === LessonType.TEXT && !lesson.content) {
            throw new Error('Content is required for text lessons');
          }
        }
      }
    }
  );

  return Lesson;
};
