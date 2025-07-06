import { DataTypes, Model, Sequelize, Op } from 'sequelize';
import { MaterialAttributes, MaterialCreationAttributes, MaterialType } from '../types';

export class Material extends Model<MaterialAttributes, MaterialCreationAttributes> implements MaterialAttributes {
  public id!: string;
  public lessonId?: string;
  public courseId?: string;
  public title!: string;
  public description?: string;
  public type!: MaterialType;
  public fileUrl?: string;
  public fileName?: string;
  public fileSize?: number;
  public mimeType?: string;
  public externalUrl?: string;
  public orderIndex?: number;
  public isDownloadable!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    // Material belongs to Lesson (optional)
    Material.belongsTo(models.Lesson, {
      foreignKey: 'lessonId',
      as: 'lesson'
    });

    // Material belongs to Course (optional)
    Material.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });
  }
}

export const initMaterial = (sequelize: Sequelize): typeof Material => {
  Material.init(
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
      type: {
        type: DataTypes.ENUM(...Object.values(MaterialType)),
        allowNull: false
      },
      fileUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0
        }
      },
      mimeType: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      externalUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0
        }
      },
      isDownloadable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
      modelName: 'Material',
      tableName: 'materials',
      timestamps: true,
      indexes: [
        {
          fields: ['lessonId']
        },
        {
          fields: ['courseId']
        },
        {
          fields: ['type']
        },
        {
          fields: ['isDownloadable']
        },
        {
          fields: ['createdAt']
        }
      ],
      validate: {
        // Ensure material belongs to either lesson or course
        belongsToLessonOrCourse() {
          if (!this.lessonId && !this.courseId) {
            throw new Error('Material must belong to either a lesson or a course');
          }
        },
        // Validate file URL or external URL based on type
        validateUrl() {
          if (this.type === MaterialType.LINK) {
            if (!this.externalUrl) {
              throw new Error('External URL is required for link materials');
            }
          } else {
            if (!this.fileUrl) {
              throw new Error('File URL is required for non-link materials');
            }
          }
        }
      },
      hooks: {
        beforeCreate: async (material: Material) => {
          // Set default order index if not provided
          if (material.orderIndex === undefined) {
            let maxOrder: number;
            
            if (material.lessonId) {
              maxOrder = await Material.max('orderIndex', {
                where: { lessonId: material.lessonId }
              }) as number;
            } else if (material.courseId) {
              maxOrder = await Material.max('orderIndex', {
                where: { 
                  courseId: material.courseId, 
                  lessonId: null as any
                }
              }) as number;
            } else {
              maxOrder = 0;
            }
            
            material.orderIndex = (maxOrder || 0) + 1;
          }
        },
        beforeUpdate: async (material: Material) => {
          // Validate downloadable flag for certain types
          if (material.type === MaterialType.LINK && material.isDownloadable) {
            throw new Error('Link materials cannot be downloadable');
          }
        }
      }
    }
  );

  return Material;
};
