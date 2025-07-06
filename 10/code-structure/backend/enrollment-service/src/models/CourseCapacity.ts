import { DataTypes, Model } from 'sequelize';
import sequelize from './database';

class CourseCapacity extends Model {
  declare id: string;
  declare courseId: string;
  declare maxCapacity: number;
  declare currentEnrollments: number;
  declare allowWaitlist: boolean;
  declare waitlistCount: number;
  declare createdAt: Date;
  declare updatedAt: Date;

  // Instance methods
  public async incrementCurrentStudents(): Promise<this> {
    await this.increment('currentEnrollments');
    return this.reload();
  }

  public async decrementCurrentStudents(): Promise<this> {
    await this.decrement('currentEnrollments');
    return this.reload();
  }

  public async incrementWaitlistCount(): Promise<this> {
    await this.increment('waitlistCount');
    return this.reload();
  }

  public async decrementWaitlistCount(): Promise<this> {
    await this.decrement('waitlistCount');
    return this.reload();
  }

  public isFull(): boolean {
    return this.currentEnrollments >= this.maxCapacity;
  }

  public hasAvailableSpots(): boolean {
    return this.currentEnrollments < this.maxCapacity;
  }

  public getAvailableSpots(): number {
    return Math.max(0, this.maxCapacity - this.currentEnrollments);
  }

  public isWaitlistAvailable(): boolean {
    return this.allowWaitlist && this.isFull();
  }

  // Static methods
  static async findByCourse(courseId: string): Promise<CourseCapacity | null> {
    return this.findOne({ where: { courseId } });
  }

  static async createForCourse(courseId: string, maxStudents: number, waitlistEnabled = true): Promise<CourseCapacity> {
    return this.create({
      courseId,
      maxStudents,
      currentStudents: 0,
      waitlistEnabled,
      waitlistCount: 0
    });
  }

  static async updateMaxCapacity(courseId: string, newMaxStudents: number): Promise<[number, CourseCapacity[]]> {
    return this.update(
      { maxStudents: newMaxStudents },
      { where: { courseId }, returning: true }
    );
  }

  static async getCoursesNearCapacity(threshold = 0.9): Promise<CourseCapacity[]> {
    return this.findAll({
      where: sequelize.where(
        sequelize.literal('(currentEnrollments * 1.0 / maxCapacity)'),
        '>=',
        threshold
      )
    });
  }

  static async getFullCourses(): Promise<CourseCapacity[]> {
    return this.findAll({
      where: sequelize.where(
        sequelize.col('currentEnrollments'),
        '>=',
        sequelize.col('maxCapacity')
      )
    });
  }
}

CourseCapacity.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      validate: {
        min: 1,
        max: 10000
      }
    },
    currentEnrollments: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    allowWaitlist: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    waitlistCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  },
  {
    sequelize,
    modelName: 'CourseCapacity',
    tableName: 'course_capacities',
    indexes: [
      {
        unique: true,
        fields: ['courseId']
      },
      {
        fields: ['maxCapacity']
      },
      {
        fields: ['currentEnrollments']
      },
      {
        fields: ['allowWaitlist']
      }
    ]
  }
);

export default CourseCapacity;
