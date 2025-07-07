import apiManager from './apiManager'

// Mock data for development
const mockUserStats = {
  level: 5,
  experience: 750,
  experienceToNextLevel: 1000,
  totalPoints: 2350,
  completedLessons: 45,
  totalLessons: 60,
  streak: 7,
  maxStreak: 15,
  averageScore: 87,
  totalStudyTime: 1200, // in minutes
  badges: [
    { name: 'Primer Logro', icon: 'star' },
    { name: 'Estudiante Activo', icon: 'fire' },
    { name: 'Colaborador', icon: 'users' },
    { name: 'Perfeccionista', icon: 'crown' }
  ]
};

const mockAchievements = [
  {
    id: 1,
    name: 'Primera Lección',
    description: 'Completa tu primera lección',
    type: 'completion',
    category: 'completion',
    points: 100,
    unlocked: true,
    claimed: true,
    unlockedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Racha de 7 días',
    description: 'Estudia 7 días consecutivos',
    type: 'streak',
    category: 'streak',
    points: 200,
    unlocked: true,
    claimed: false,
    unlockedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 3,
    name: 'Estudiante Dedicado',
    description: 'Completa 10 lecciones',
    type: 'completion',
    category: 'completion',
    points: 300,
    unlocked: false,
    progress: { current: 7, target: 10 }
  },
  {
    id: 4,
    name: 'Puntuación Perfecta',
    description: 'Obtén 100% en 5 lecciones',
    type: 'score',
    category: 'score',
    points: 500,
    unlocked: false,
    progress: { current: 3, target: 5 }
  }
];

const mockLeaderboard = [
  {
    rank: 1,
    userId: 1,
    username: 'María García',
    avatar: null,
    institution: 'Universidad Nacional',
    points: 5200,
    level: 8,
    completedLessons: 85,
    streak: 25
  },
  {
    rank: 2,
    userId: 2,
    username: 'Carlos López',
    avatar: null,
    institution: 'Universidad Privada',
    points: 4800,
    level: 7,
    completedLessons: 78,
    streak: 12
  },
  {
    rank: 3,
    userId: 3,
    username: 'Ana Rodríguez',
    avatar: null,
    institution: 'Instituto Tecnológico',
    points: 4200,
    level: 7,
    completedLessons: 71,
    streak: 8
  },
  {
    rank: 4,
    userId: 4,
    username: 'Juan Pérez',
    avatar: null,
    institution: 'Universidad Nacional',
    points: 3800,
    level: 6,
    completedLessons: 65,
    streak: 15
  },
  {
    rank: 5,
    userId: 5,
    username: 'Laura Martínez',
    avatar: null,
    institution: 'Universidad Privada',
    points: 3200,
    level: 6,
    completedLessons: 58,
    streak: 3
  }
];

// Gamification service
export const gamificationService = {
  // Get user stats
  getUserStats: async () => {
    try {
      const response = await apiManager.request('/gamification/stats');
      return response;
    } catch (error) {
      console.error('Error getting user stats:', error);
      // Fallback to mock data
      return { data: mockUserStats };
    }
  },

  // Get user achievements
  getUserAchievements: async () => {
    try {
      const response = await apiManager.request('/gamification/achievements');
      return response;
    } catch (error) {
      console.error('Error getting achievements:', error);
      return { data: mockAchievements };
    }
  },

  // Get leaderboard
  getLeaderboard: async (type = 'points', params = {}) => {
    try {
      const response = await apiManager.request(`/gamification/leaderboard/${type}`, { params });
      return response;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return { data: mockLeaderboard };
    }
  },

  // Claim achievement
  claimAchievement: async (achievementId) => {
    try {
      const response = await apiManager.request(`/gamification/achievements/${achievementId}/claim`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Error claiming achievement:', error);
      throw error;
    }
  },

  // Get points history
  getPointsHistory: async (params = {}) => {
    try {
      const response = await apiManager.request('/gamification/points/history', { params });
      return response;
    } catch (error) {
      console.error('Error getting points history:', error);
      throw error;
    }
  },

  // Award points manually (for special actions)
  awardPoints: async (pointsData) => {
    try {
      const response = await apiManager.request('/gamification/points/award', {
        method: 'POST',
        data: pointsData
      });
      return response;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  },

  // Get available achievements
  getAvailableAchievements: async () => {
    try {
      const response = await apiManager.request('/gamification/achievements/available');
      return response;
    } catch (error) {
      console.error('Error getting available achievements:', error);
      throw error;
    }
  },

  // Get user's ranking
  getUserRanking: async () => {
    try {
      const response = await apiManager.request('/gamification/ranking');
      return response;
    } catch (error) {
      console.error('Error getting user ranking:', error);
      throw error;
    }
  }
};

export default gamificationService;
