import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const UserStatsCard = ({ userStats }) => {
  if (!userStats) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <p className="text-muted">No hay estadísticas disponibles</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    level = 1,
    experience = 0,
    experienceToNextLevel = 100,
    totalPoints = 0,
    completedLessons = 0,
    totalLessons = 0,
    streak = 0,
    maxStreak = 0,
    averageScore = 0,
    totalStudyTime = 0,
    badges = []
  } = userStats;

  const experiencePercentage = (experience / experienceToNextLevel) * 100;
  const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="row">
      {/* Tarjeta de nivel y experiencia */}
      <div className="col-md-6 col-lg-4 mb-4">
        <div className="card h-100">
          <div className="card-body text-center">
            <h5 className="card-title">
              <i className="fas fa-star text-warning me-2"></i>
              Nivel {level}
            </h5>
            <div className="mb-3" style={{ width: '120px', height: '120px', margin: '0 auto' }}>
              <CircularProgressbar
                value={experiencePercentage}
                text={`${experience}/${experienceToNextLevel}`}
                styles={buildStyles({
                  textSize: '12px',
                  pathColor: '#007bff',
                  textColor: '#007bff',
                  trailColor: '#e9ecef',
                })}
              />
            </div>
            <p className="text-muted mb-0">Experiencia</p>
            <div className="progress mt-2">
              <div 
                className="progress-bar bg-primary" 
                style={{ width: `${experiencePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta de puntos totales */}
      <div className="col-md-6 col-lg-4 mb-4">
        <div className="card h-100">
          <div className="card-body text-center">
            <h5 className="card-title">
              <i className="fas fa-coins text-warning me-2"></i>
              Puntos Totales
            </h5>
            <div className="display-4 text-primary mb-3">{totalPoints.toLocaleString()}</div>
            <div className="row text-center">
              <div className="col-6">
                <div className="text-success">
                  <i className="fas fa-arrow-up me-1"></i>
                  <small>Esta semana</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-muted">
                  <small>Promedio: {Math.round(averageScore)}%</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta de racha */}
      <div className="col-md-6 col-lg-4 mb-4">
        <div className="card h-100">
          <div className="card-body text-center">
            <h5 className="card-title">
              <i className="fas fa-fire text-danger me-2"></i>
              Racha de Estudio
            </h5>
            <div className="display-4 text-danger mb-3">{streak}</div>
            <p className="text-muted mb-1">días consecutivos</p>
            <small className="text-success">
              <i className="fas fa-trophy me-1"></i>
              Récord: {maxStreak} días
            </small>
          </div>
        </div>
      </div>

      {/* Tarjeta de progreso de lecciones */}
      <div className="col-md-6 col-lg-4 mb-4">
        <div className="card h-100">
          <div className="card-body text-center">
            <h5 className="card-title">
              <i className="fas fa-book-open text-success me-2"></i>
              Progreso de Lecciones
            </h5>
            <div className="mb-3" style={{ width: '100px', height: '100px', margin: '0 auto' }}>
              <CircularProgressbar
                value={completionPercentage}
                text={`${Math.round(completionPercentage)}%`}
                styles={buildStyles({
                  textSize: '16px',
                  pathColor: '#28a745',
                  textColor: '#28a745',
                  trailColor: '#e9ecef',
                })}
              />
            </div>
            <p className="text-muted mb-0">
              {completedLessons} de {totalLessons} lecciones
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta de tiempo de estudio */}
      <div className="col-md-6 col-lg-4 mb-4">
        <div className="card h-100">
          <div className="card-body text-center">
            <h5 className="card-title">
              <i className="fas fa-clock text-info me-2"></i>
              Tiempo de Estudio
            </h5>
            <div className="display-4 text-info mb-3">
              {Math.round(totalStudyTime / 60)}h
            </div>
            <p className="text-muted mb-0">tiempo total</p>
            <small className="text-success">
              <i className="fas fa-chart-line me-1"></i>
              Promedio: {Math.round(totalStudyTime / 60 / 7)}h/semana
            </small>
          </div>
        </div>
      </div>

      {/* Tarjeta de badges */}
      <div className="col-md-6 col-lg-4 mb-4">
        <div className="card h-100">
          <div className="card-body text-center">
            <h5 className="card-title">
              <i className="fas fa-award text-purple me-2"></i>
              Insignias
            </h5>
            <div className="display-4 text-purple mb-3">{badges.length}</div>
            <p className="text-muted mb-3">insignias ganadas</p>
            <div className="d-flex justify-content-center flex-wrap">
              {badges.slice(0, 6).map((badge, index) => (
                <span
                  key={index}
                  className="badge bg-secondary m-1"
                  title={badge.name}
                >
                  <i className={`fas fa-${badge.icon || 'medal'}`}></i>
                </span>
              ))}
              {badges.length > 6 && (
                <span className="badge bg-light text-dark m-1">
                  +{badges.length - 6}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatsCard;
