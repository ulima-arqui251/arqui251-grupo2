import React, { useState } from 'react';

const LeaderboardSection = ({ leaderboard, currentUser }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  
  const periods = {
    'weekly': 'Esta Semana',
    'monthly': 'Este Mes',
    'all_time': 'Todo el Tiempo'
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <i className="fas fa-crown text-warning" style={{ fontSize: '1.5rem' }}></i>;
      case 2:
        return <i className="fas fa-medal text-secondary" style={{ fontSize: '1.2rem' }}></i>;
      case 3:
        return <i className="fas fa-medal text-warning" style={{ fontSize: '1.2rem' }}></i>;
      default:
        return <span className="badge bg-primary rounded-pill">{rank}</span>;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1:
        return 'border-warning bg-light';
      case 2:
        return 'border-secondary bg-light';
      case 3:
        return 'border-warning bg-light';
      default:
        return 'border-light';
    }
  };

  const getCurrentUserRank = () => {
    if (!currentUser) return null;
    const userEntry = leaderboard.find(entry => entry.userId === currentUser.id);
    return userEntry ? userEntry.rank : null;
  };

  const currentUserRank = getCurrentUserRank();

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-trophy text-muted" style={{ fontSize: '4rem' }}></i>
        <h4 className="mt-3 text-muted">No hay datos del ranking</h4>
        <p className="text-muted">¡Completa lecciones para aparecer en el ranking!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Selector de período */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <i className="fas fa-trophy text-warning me-2"></i>
              Ranking de Estudiantes
            </h4>
            <div className="btn-group" role="group">
              {Object.entries(periods).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`btn ${selectedPeriod === key ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedPeriod(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Información del usuario actual */}
      {currentUserRank && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title mb-0">Tu Posición Actual</h5>
                    <p className="card-text mb-0">
                      Estás en el puesto #{currentUserRank} en el ranking {periods[selectedPeriod].toLowerCase()}
                    </p>
                  </div>
                  <div className="text-end">
                    <div className="display-4">#{currentUserRank}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 destacado */}
      <div className="row mb-4">
        {leaderboard.slice(0, 3).map((entry, index) => (
          <div key={entry.userId} className="col-md-4 mb-3">
            <div className={`card h-100 ${getRankClass(entry.rank)}`}>
              <div className="card-body text-center">
                <div className="mb-3">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="mb-3">
                  <img
                    src={entry.avatar || `https://ui-avatars.com/api/?name=${entry.username}&background=007bff&color=fff`}
                    alt={entry.username}
                    className="rounded-circle"
                    style={{ width: '60px', height: '60px' }}
                  />
                </div>
                <h5 className="card-title">{entry.username}</h5>
                <p className="text-muted mb-2">{entry.institution || 'Estudiante'}</p>
                <div className="row text-center">
                  <div className="col-6">
                    <div className="text-primary">
                      <strong>{entry.points.toLocaleString()}</strong>
                    </div>
                    <small className="text-muted">Puntos</small>
                  </div>
                  <div className="col-6">
                    <div className="text-success">
                      <strong>{entry.level}</strong>
                    </div>
                    <small className="text-muted">Nivel</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ranking completo */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Ranking Completo</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Posición</th>
                      <th>Estudiante</th>
                      <th>Institución</th>
                      <th>Puntos</th>
                      <th>Nivel</th>
                      <th>Lecciones</th>
                      <th>Racha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr 
                        key={entry.userId}
                        className={entry.userId === currentUser?.id ? 'table-primary' : ''}
                      >
                        <td>
                          <div className="d-flex align-items-center">
                            {getRankIcon(entry.rank)}
                            {entry.rank > 3 && (
                              <span className="ms-2">#{entry.rank}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={entry.avatar || `https://ui-avatars.com/api/?name=${entry.username}&background=007bff&color=fff`}
                              alt={entry.username}
                              className="rounded-circle me-2"
                              style={{ width: '32px', height: '32px' }}
                            />
                            <div>
                              <strong>{entry.username}</strong>
                              {entry.userId === currentUser?.id && (
                                <span className="badge bg-primary ms-2">Tú</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-muted">{entry.institution || 'No especificada'}</span>
                        </td>
                        <td>
                          <strong className="text-primary">{entry.points.toLocaleString()}</strong>
                        </td>
                        <td>
                          <span className="badge bg-success">{entry.level}</span>
                        </td>
                        <td>
                          <span className="text-muted">{entry.completedLessons || 0}</span>
                        </td>
                        <td>
                          <span className="text-danger">
                            <i className="fas fa-fire me-1"></i>
                            {entry.streak || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">
                <i className="fas fa-info-circle me-2"></i>
                Información del Ranking
              </h6>
              <p className="card-text mb-0">
                <small className="text-muted">
                  • Los puntos se actualizan automáticamente al completar lecciones y actividades.<br/>
                  • El ranking se actualiza cada hora.<br/>
                  • Solo se muestran usuarios que han completado al menos una lección.
                </small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardSection;
