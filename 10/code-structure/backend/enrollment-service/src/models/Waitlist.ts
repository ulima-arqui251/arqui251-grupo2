import { DataTypes, Model, Op } from 'sequelize';
import sequelize from './database';

class Waitlist extends Model {
  declare id: string;
  declare userId: string;
  declare courseId: string;
  declare position: number;
  declare priority: number;
  declare joinedAt: Date;
  declare requestedAt: Date;
  declare notified: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;

  // Instance methods
  public markAsNotified(): Promise<this> {
    return this.update({ notified: true });
  }

  // Static methods
  static async addToWaitlist(userId: string, courseId: string): Promise<Waitlist> {
    const maxPosition = await this.max('position', { where: { courseId } }) as number || 0;
    
    return this.create({
      userId,
      courseId,
      position: maxPosition + 1,
      joinedAt: new Date(),
      notified: false
    });
  }

  static async removeFromWaitlist(userId: string, courseId: string): Promise<boolean> {
    const waitlistEntry = await this.findOne({
      where: { userId, courseId }
    });

    if (!waitlistEntry) {
      return false;
    }

    const position = waitlistEntry.position;
    
    // Eliminar entrada
    await waitlistEntry.destroy();
    
    // Reorganizar posiciones
    await this.update(
      { position: sequelize.literal('position - 1') },
      {
        where: {
          courseId,
          position: { [Op.gt]: position }
        }
      }
    );

    return true;
  }

  static async getNextInWaitlist(courseId: string): Promise<Waitlist | null> {
    return this.findOne({
      where: { courseId },
      order: [['position', 'ASC']]
    });
  }

  static async getCourseWaitlist(courseId: string): Promise<Waitlist[]> {
    return this.findAll({
      where: { courseId },
      order: [['position', 'ASC']]
    });
  }

  static async getUserWaitlistPosition(userId: string, courseId: string): Promise<number | null> {
    const entry = await this.findOne({
      where: { userId, courseId }
    });
    return entry ? entry.position : null;
  }

  static async isUserInWaitlist(userId: string, courseId: string): Promise<boolean> {
    const entry = await this.findOne({
      where: { userId, courseId }
    });
    return !!entry;
  }

  static async processWaitlistForCourse(courseId: string, spotsAvailable: number): Promise<Waitlist[]> {
    const waitlistEntries = await this.findAll({
      where: { courseId },
      order: [['position', 'ASC']],
      limit: spotsAvailable
    });

    // Marcar como notificados
    for (const entry of waitlistEntries) {
      await entry.markAsNotified();
    }

    return waitlistEntries;
  }

  static async getWaitlistStats(courseId?: string) {
    const whereClause = courseId ? { courseId } : {};
    
    const [
      totalWaitlisted,
      totalNotified,
      totalUnnotified
    ] = await Promise.all([
      this.count({ where: whereClause }),
      this.count({ where: { ...whereClause, notified: true } }),
      this.count({ where: { ...whereClause, notified: false } })
    ]);

    return {
      totalWaitlisted,
      totalNotified,
      totalUnnotified
    };
  }
}

Waitlist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10
      }
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    requestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    notified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'Waitlist',
    tableName: 'waitlists',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'courseId']
      },
      {
        fields: ['courseId', 'position']
      },
      {
        fields: ['courseId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['notified']
      },
      {
        fields: ['joinedAt']
      },
      {
        fields: ['requestedAt']
      },
      {
        fields: ['priority']
      }
    ]
  }
);

export default Waitlist;
