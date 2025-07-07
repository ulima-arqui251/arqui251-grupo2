import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

const StatsSection = ({ user }) => {
  // Mock stats data
  const stats = {
    studyStreak: 12,
    totalStudyTime: 2400, // en minutos
    lessonsCompleted: 45,
    averageScore: 87,
    achievements: 8,
    weeklyGoalProgress: 75,
    monthlyStudyDays: 18,
    favoriteSubject: 'Matemáticas',
    strongestSkill: 'Resolución de Problemas',
    improvementArea: 'Velocidad de Lectura'
  };

  const formatStudyTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const weeklyData = [
    { day: 'Lun', minutes: 45, goal: 60 },
    { day: 'Mar', minutes: 60, goal: 60 },
    { day: 'Mié', minutes: 30, goal: 60 },
    { day: 'Jue', minutes: 75, goal: 60 },
    { day: 'Vie', minutes: 50, goal: 60 },
    { day: 'Sáb', minutes: 90, goal: 60 },
    { day: 'Dom', minutes: 40, goal: 60 }
  ];

  const subjectProgress = [
    { subject: 'Matemáticas', completed: 85, total: 100 },
    { subject: 'Física', completed: 60, total: 80 },
    { subject: 'Química', completed: 45, total: 70 },
    { subject: 'Historia', completed: 30, total: 50 }
  ];

  return (
    <div className="row">
      {/* Estadísticas principales */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-chart-bar me-2"></i>
              Resumen de Estadísticas
            </h5>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-3 mb-3">
                <div className="stat-card">
                  <i className="fas fa-fire text-danger mb-2" style={{ fontSize: '2rem' }}></i>
                  <h3 className="text-danger">{stats.studyStreak}</h3>
                  <p className="text-muted mb-0">Días de racha</p>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="stat-card">
                  <i className="fas fa-clock text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                  <h3 className="text-primary">{formatStudyTime(stats.totalStudyTime)}</h3>
                  <p className="text-muted mb-0">Tiempo total</p>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="stat-card">
                  <i className="fas fa-book text-success mb-2" style={{ fontSize: '2rem' }}></i>
                  <h3 className="text-success">{stats.lessonsCompleted}</h3>
                  <p className="text-muted mb-0">Lecciones completadas</p>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="stat-card">
                  <i className="fas fa-star text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                  <h3 className="text-warning">{stats.averageScore}%</h3>
                  <p className="text-muted mb-0">Puntuación promedio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progreso semanal */}
      <div className="col-md-8 mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-calendar-week me-2"></i>
              Actividad Semanal
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              {weeklyData.map((day, index) => (
                <div key={index} className="col text-center">
                  <div className="mb-2">
                    <div 
                      className="progress vertical-progress" 
                      style={{ height: '100px', width: '20px', margin: '0 auto' }}
                    >
                      <div 
                        className={`progress-bar ${day.minutes >= day.goal ? 'bg-success' : 'bg-primary'}`}
                        style={{ 
                          height: `${Math.min((day.minutes / day.goal) * 100, 100)}%`,
                          width: '100%'
                        }}
                      ></div>
                    </div>
                  </div>
                  <small className="text-muted">{day.day}</small>
                  <div className="small">{day.minutes}m</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-3">
              <small className="text-muted">
                Meta diaria: 60 minutos • 
                <span className="text-success ms-1">
                  {weeklyData.filter(day => day.minutes >= day.goal).length}/7 días completados
                </span>
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Progreso de meta semanal */}
      <div className="col-md-4 mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-target me-2"></i>
              Meta Semanal
            </h6>
          </div>
          <div className="card-body text-center">
            <div style={{ width: '120px', height: '120px', margin: '0 auto' }}>
              <CircularProgressbar
                value={stats.weeklyGoalProgress}
                text={`${stats.weeklyGoalProgress}%`}
                styles={buildStyles({
                  textSize: '16px',
                  pathColor: stats.weeklyGoalProgress >= 100 ? '#28a745' : '#007bff',
                  textColor: stats.weeklyGoalProgress >= 100 ? '#28a745' : '#007bff',
                  trailColor: '#e9ecef',
                })}
              />
            </div>
            <p className="text-muted mt-3 mb-0">
              7 horas esta semana
            </p>
            {stats.weeklyGoalProgress >= 100 && (
              <div className="alert alert-success mt-2 py-2">
                <i className="fas fa-trophy me-1"></i>
                ¡Meta alcanzada!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progreso por materia */}
      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-graduation-cap me-2"></i>
              Progreso por Materia
            </h6>
          </div>
          <div className="card-body">
            {subjectProgress.map((subject, index) => (
              <div key={index} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-bold">{subject.subject}</span>
                  <span className="text-muted">
                    {subject.completed}/{subject.total}
                  </span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${(subject.completed / subject.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-info-circle me-2"></i>
              Análisis de Rendimiento
            </h6>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="fw-bold text-success">
                <i className="fas fa-thumbs-up me-2"></i>
                Tu fuerte:
              </label>
              <p className="mb-0">{stats.strongestSkill}</p>
            </div>
            
            <div className="mb-3">
              <label className="fw-bold text-info">
                <i className="fas fa-heart me-2"></i>
                Materia favorita:
              </label>
              <p className="mb-0">{stats.favoriteSubject}</p>
            </div>
            
            <div className="mb-3">
              <label className="fw-bold text-warning">
                <i className="fas fa-arrow-up me-2"></i>
                Área de mejora:
              </label>
              <p className="mb-0">{stats.improvementArea}</p>
            </div>

            <div className="alert alert-light mt-3">
              <h6 className="alert-heading">
                <i className="fas fa-lightbulb me-2"></i>
                Sugerencia
              </h6>
              <p className="mb-0">
                Considera dedicar más tiempo a {stats.improvementArea} para mejorar tu rendimiento general.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logros recientes */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-medal me-2"></i>
              Logros Recientes
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <div className="achievement-card text-center p-3 border rounded">
                  <i className="fas fa-fire text-danger mb-2" style={{ fontSize: '2rem' }}></i>
                  <h6>Racha de 10 días</h6>
                  <small className="text-muted">Hace 2 días</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="achievement-card text-center p-3 border rounded">
                  <i className="fas fa-star text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                  <h6>Puntuación Perfecta</h6>
                  <small className="text-muted">Hace 1 semana</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="achievement-card text-center p-3 border rounded">
                  <i className="fas fa-book text-success mb-2" style={{ fontSize: '2rem' }}></i>
                  <h6>50 Lecciones</h6>
                  <small className="text-muted">Hace 3 días</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
