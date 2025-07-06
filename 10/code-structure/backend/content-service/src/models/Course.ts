import { DataTypes, Model, Sequelize } from 'sequelize';
import { CourseAttributes, CourseCreationAttributes, CourseStatus, DifficultyLevel } from '../types';

export class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public instructorId!: string;
  public categoryId?: string;
  public status!: CourseStatus;
  public difficultyLevel!: DifficultyLevel;
  public duration?: number;
  public price?: number;
  public thumbnailUrl?: string;
  public previewVideoUrl?: string;
  public requirements?: string[];
  public learningOutcomes?: string[];
  public tags?: string[];
  public maxStudents?: number;
  public currentStudents?: number;
  public averageRating?: number;
  public totalRatings?: number;
  public isPublic!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    // Course has many Lessons
    Course.hasMany(models.Lesson, {
      foreignKey: 'courseId',
      as: 'lessons',
      onDelete: 'CASCADE'
    });

    // Course has many Materials
    Course.hasMany(models.Material, {
      foreignKey: 'courseId',
      as: 'materials',
      onDelete: 'CASCADE'
    });

    // Course has many Quizzes
    Course.hasMany(models.Quiz, {
      foreignKey: 'courseId',
      as: 'quizzes',
      onDelete: 'CASCADE'
    });

    // Course belongs to Category
    Course.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });

    // Course has many Enrollments
    Course.hasMany(models.CourseEnrollment, {
      foreignKey: 'courseId',
      as: 'enrollments',
      onDelete: 'CASCADE'
    });

    // Course belongs to many Tags - TODO: Implement Tag model
    // Course.belongsToMany(models.Tag, {
    //   through: 'CourseTags',
    //   foreignKey: 'courseId',
    //   otherKey: 'tagId',
    //   as: 'courseTags'
    // });
  }
}

export const initCourse = (sequelize: Sequelize): typeof Course => {
  Course.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [10, 5000]
        }
      },
      instructorId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notEmpty: true,
          isUUID: 4
        }
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        validate: {
          isUUID: 4
        }
      },
      status: {
        type: DataTypes.ENUM(...Object.values(CourseStatus)),
        allowNull: false,
        defaultValue: CourseStatus.DRAFT
      },
      difficultyLevel: {
        type: DataTypes.ENUM(...Object.values(DifficultyLevel)),
        allowNull: false,
        defaultValue: DifficultyLevel.BEGINNER
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0
        }
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0
        }
      },
      thumbnailUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      previewVideoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      requirements: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      learningOutcomes: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      maxStudents: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1
        }
      },
      currentStudents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      averageRating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        validate: {
          min: 0,
          max: 5
        }
      },
      totalRatings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
      modelName: 'Course',
      tableName: 'courses',
      timestamps: true,
      indexes: [
        {
          fields: ['instructorId']
        },
        {
          fields: ['categoryId']
        },
        {
          fields: ['status']
        },
        {
          fields: ['difficultyLevel']
        },
        {
          fields: ['isPublic']
        },
        {
          fields: ['createdAt']
        },
        {
          fields: ['averageRating']
        }
      ],
      hooks: {
        beforeCreate: async (course: Course) => {
          // Ensure current students starts at 0
          if (!course.currentStudents) {
            course.currentStudents = 0;
          }
          
          // Ensure total ratings starts at 0
          if (!course.totalRatings) {
            course.totalRatings = 0;
          }
        },
        beforeUpdate: async (course: Course) => {
          // Ensure current students doesn't exceed max students
          if (course.maxStudents && course.currentStudents && course.currentStudents > course.maxStudents) {
            throw new Error('Current students cannot exceed maximum students');
          }
        }
      }
    }
  );

  return Course;
};
