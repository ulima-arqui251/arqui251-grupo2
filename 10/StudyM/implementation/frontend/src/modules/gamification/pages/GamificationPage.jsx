import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNotifications } from '../../../shared/context/NotificationContext';
import { gamificationService } from '../../../shared/services/gamificationService';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import UserStatsCard from '../components/UserStatsCard';
import AchievementsSection from '../components/AchievementsSection';
import LeaderboardSection from '../components/LeaderboardSection';

const GamificationPage = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [statsResponse, achievementsResponse, leaderboardResponse] = await Promise.all([
        gamificationService.getUserStats(),
        gamificationService.getUserAchievements(),
        gamificationService.getLeaderboard()
      ]);

      setUserStats(statsResponse.data);
      setAchievements(achievementsResponse.data);
      setLeaderboard(leaderboardResponse.data);
    } catch (error) {
      console.error('Error loading gamification data:', error);
      showNotification('Error al cargar los datos de gamificación', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                <i className="fas fa-trophy text-warning me-2"></i>
                Gamificación
              </h1>
              <p className="text-muted mb-0">
                Revisa tu progreso, logros y posición en el ranking
              </p>
            </div>
            <div className="text-end">
              <div className="badge bg-primary fs-6 px-3 py-2">
                <i className="fas fa-star me-1"></i>
                Nivel {userStats?.level || 1}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de pestañas */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills nav-justified">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                <i className="fas fa-chart-line me-2"></i>
                Estadísticas
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'achievements' ? 'active' : ''}`}
                onClick={() => setActiveTab('achievements')}
              >
                <i className="fas fa-medal me-2"></i>
                Logros
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('leaderboard')}
              >
                <i className="fas fa-trophy me-2"></i>
                Ranking
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Contenido según pestaña activa */}
      <div className="tab-content">
        {activeTab === 'stats' && (
          <div className="tab-pane active">
            <UserStatsCard userStats={userStats} />
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="tab-pane active">
            <AchievementsSection 
              achievements={achievements} 
              onAchievementClaim={(achievementId) => {
                // Actualizar logros después de reclamar
                loadGamificationData();
              }}
            />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="tab-pane active">
            <LeaderboardSection 
              leaderboard={leaderboard} 
              currentUser={user}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GamificationPage;
