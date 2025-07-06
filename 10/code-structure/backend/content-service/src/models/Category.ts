import { DataTypes, Model, Sequelize, Op } from 'sequelize';
import { CategoryAttributes, CategoryCreationAttributes } from '../types';

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public parentId?: string;
  public slug!: string;
  public isActive!: boolean;
  public orderIndex?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    // Category has many Courses
    Category.hasMany(models.Course, {
      foreignKey: 'categoryId',
      as: 'courses'
    });

    // Category can have a parent Category (for subcategories)
    Category.belongsTo(Category, {
      foreignKey: 'parentId',
      as: 'parent'
    });

    // Category can have many child Categories
    Category.hasMany(Category, {
      foreignKey: 'parentId',
      as: 'children'
    });
  }
}

export const initCategory = (sequelize: Sequelize): typeof Category => {
  Category.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 1000]
        }
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        validate: {
          isUUID: 4
        }
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [2, 100],
          is: /^[a-z0-9-]+$/ // lowercase letters, numbers, and hyphens only
        }
      },
      isActive: {
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
      modelName: 'Category',
      tableName: 'categories',
      timestamps: true,
      indexes: [
        {
          fields: ['parentId']
        },
        {
          fields: ['slug'],
          unique: true
        },
        {
          fields: ['isActive']
        },
        {
          fields: ['orderIndex']
        },
        {
          fields: ['createdAt']
        }
      ],
      validate: {
        // Prevent self-referencing parent
        validateParent(this: Category) {
          if (this.parentId === this.id) {
            throw new Error('Category cannot be its own parent');
          }
        }
      },
      hooks: {
        beforeCreate: async (category: Category) => {
          // Generate slug from name if not provided
          if (!category.slug) {
            category.slug = category.name
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim();
          }
          
          // Set default order index if not provided
          if (category.orderIndex === undefined) {
            const whereCondition = category.parentId ? 
              { parentId: category.parentId } : 
              { parentId: { [Op.is]: null } };
            const maxOrder = await Category.max('orderIndex', { where: whereCondition }) as number;
            category.orderIndex = (maxOrder || 0) + 1;
          }
        },
        beforeUpdate: async (category: Category) => {
          // Update slug if name changed
          if (category.changed('name') && !category.changed('slug')) {
            category.slug = category.name
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim();
          }
        }
      }
    }
  );

  return Category;
};
