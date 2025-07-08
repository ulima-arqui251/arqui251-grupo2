import React, { useState } from 'react';
import { gamificationService } from '../../../shared/services/gamificationService';
import { useNotifications } from '../../../shared/context/NotificationContext';

const AchievementsSection = ({ achievements, onAchievementClaim }) => {
  const { showNotification } = useNotifications();
  const [claimingId, setClaimingId] = useState(null);

  const handleClaimAchievement = async (achievementId) => {
    try {
      setClaimingId(achievementId);
      await gamificationService.claimAchievement(achievementId);
      showNotification('¡Logro reclamado exitosamente!', 'success');
      onAchievementClaim(achievementId);
    } catch (error) {
      console.error('Error claiming achievement:', error);
      showNotification('Error al reclamar el logro', 'error');
    } finally {
      setClaimingId(null);
    }
  };

  const getAchievementIcon = (type) => {
    const icons = {
      'completion': 'fas fa-check-circle',
      'streak': 'fas fa-fire',
      'score': 'fas fa-star',
      'time': 'fas fa-clock',
      'special': 'fas fa-crown',
      'default': 'fas fa-medal'
    };
    return icons[type] || icons.default;
  };

  const getAchievementColor = (type, unlocked) => {
    if (!unlocked) return 'text-muted';
    
    const colors = {
      'completion': 'text-success',
      'streak': 'text-danger',
      'score': 'text-warning',
      'time': 'text-info',
      'special': 'text-purple',
      'default': 'text-primary'
    };
    return colors[type] || colors.default;
  };

  const categorizedAchievements = achievements.reduce((acc, achievement) => {
    const category = achievement.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {});

  if (achievements.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-medal text-muted" style={{ fontSize: '4rem' }}></i>
        <h4 className="mt-3 text-muted">No hay logros disponibles</h4>
        <p className="text-muted">¡Completa lecciones para desbloquear logros!</p>
      </div>
    );
  }

  return (
    <div>
      {Object.entries(categorizedAchievements).map(([category, categoryAchievements]) => (
        <div key={category} className="mb-5">
          <h4 className="mb-3 text-capitalize">
            <i className="fas fa-trophy text-warning me-2"></i>
            {category === 'general' ? 'Logros Generales' : 
             category === 'completion' ? 'Logros de Finalización' :
             category === 'streak' ? 'Logros de Racha' :
             category === 'score' ? 'Logros de Puntuación' :
             category === 'time' ? 'Logros de Tiempo' :
             category === 'special' ? 'Logros Especiales' : category}
          </h4>
          
          <div className="row">
            {categoryAchievements.map((achievement) => (
              <div key={achievement.id} className="col-md-6 col-lg-4 mb-4">
                <div className={`card h-100 ${achievement.unlocked ? 'border-success' : 'border-light'}`}>
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <i 
                        className={`${getAchievementIcon(achievement.type)} ${getAchievementColor(achievement.type, achievement.unlocked)}`}
                        style={{ fontSize: '3rem' }}
                      ></i>
                      {achievement.unlocked && (
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge bg-success">
                            <i className="fas fa-check"></i>
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <h5 className={`card-title ${achievement.unlocked ? '' : 'text-muted'}`}>
                      {achievement.name}
                    </h5>
                    
                    <p className={`card-text ${achievement.unlocked ? '' : 'text-muted'}`}>
                      {achievement.description}
                    </p>
                    
                    {achievement.progress !== undefined && (
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">Progreso</small>
                          <small className="text-muted">
                            {achievement.progress.current}/{achievement.progress.target}
                          </small>
                        </div>
                        <div className="progress">
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ 
                              width: `${(achievement.progress.current / achievement.progress.target) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-primary">
                          <i className="fas fa-coins me-1"></i>
                          {achievement.points} pts
                        </span>
                      </div>
                      
                      {achievement.unlocked && !achievement.claimed && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleClaimAchievement(achievement.id)}
                          disabled={claimingId === achievement.id}
                        >
                          {claimingId === achievement.id ? (
                            <span>
                              <i className="fas fa-spinner fa-spin me-1"></i>
                              Reclamando...
                            </span>
                          ) : (
                            <span>
                              <i className="fas fa-gift me-1"></i>
                              Reclamar
                            </span>
                          )}
                        </button>
                      )}
                      
                      {achievement.claimed && (
                        <span className="badge bg-success">
                          <i className="fas fa-check me-1"></i>
                          Reclamado
                        </span>
                      )}
                    </div>
                    
                    {achievement.unlocked && achievement.unlockedAt && (
                      <small className="text-muted d-block mt-2">
                        Desbloqueado: {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementsSection;
