import React, { useState } from 'react';

const StudyGroupCard = ({ group, currentUser, onJoinGroup }) => {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinGroup = async () => {
    try {
      setIsJoining(true);
      await onJoinGroup(group.id);
    } catch (error) {
      console.error('Error joining group:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'open': { class: 'bg-success', text: 'Abierto' },
      'closed': { class: 'bg-danger', text: 'Cerrado' },
      'private': { class: 'bg-warning', text: 'Privado' },
      'full': { class: 'bg-secondary', text: 'Completo' }
    };
    return badges[status] || badges.open;
  };

  const formatLastActivity = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `${diffInDays} días`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas`;
    return date.toLocaleDateString();
  };

  const isUserMember = group.members?.some(member => member.id === currentUser?.id);
  const canJoin = group.status === 'open' && !isUserMember && group.memberCount < group.maxMembers;
  const statusBadge = getStatusBadge(group.status);

  return (
    <div className="card h-100">
      <div className="card-body">
        {/* Header del grupo */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1">
            <h5 className="card-title mb-1">{group.name}</h5>
            <p className="text-muted mb-0">{group.subject}</p>
          </div>
          <span className={`badge ${statusBadge.class}`}>
            {statusBadge.text}
          </span>
        </div>

        {/* Descripción */}
        <p className="card-text text-muted mb-3" style={{ fontSize: '0.9rem' }}>
          {group.description}
        </p>

        {/* Información del grupo */}
        <div className="mb-3">
          <div className="row text-center">
            <div className="col-4">
              <div className="text-primary">
                <i className="fas fa-users"></i>
              </div>
              <small className="text-muted d-block">
                {group.memberCount}/{group.maxMembers}
              </small>
              <small className="text-muted">Miembros</small>
            </div>
            <div className="col-4">
              <div className="text-success">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <small className="text-muted d-block">{group.level}</small>
              <small className="text-muted">Nivel</small>
            </div>
            <div className="col-4">
              <div className="text-info">
                <i className="fas fa-clock"></i>
              </div>
              <small className="text-muted d-block">
                {formatLastActivity(group.lastActivity)}
              </small>
              <small className="text-muted">Actividad</small>
            </div>
          </div>
        </div>

        {/* Creador del grupo */}
        <div className="d-flex align-items-center mb-3">
          <img
            src={group.creator.avatar || `https://ui-avatars.com/api/?name=${group.creator.username}&background=007bff&color=fff`}
            alt={group.creator.username}
            className="rounded-circle me-2"
            style={{ width: '24px', height: '24px' }}
          />
          <small className="text-muted">
            Creado por <strong>{group.creator.username}</strong>
          </small>
        </div>

        {/* Objetivos del grupo */}
        {group.goals && group.goals.length > 0 && (
          <div className="mb-3">
            <small className="text-muted fw-bold">Objetivos:</small>
            <ul className="list-unstyled mb-0">
              {group.goals.slice(0, 2).map((goal, index) => (
                <li key={index} style={{ fontSize: '0.8rem' }}>
                  <i className="fas fa-check-circle text-success me-1"></i>
                  {goal}
                </li>
              ))}
              {group.goals.length > 2 && (
                <li style={{ fontSize: '0.8rem' }}>
                  <i className="fas fa-ellipsis-h text-muted me-1"></i>
                  y {group.goals.length - 2} más...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Horarios de estudio */}
        {group.schedule && (
          <div className="mb-3">
            <small className="text-muted fw-bold">Horario:</small>
            <div style={{ fontSize: '0.8rem' }}>
              <i className="fas fa-calendar text-primary me-1"></i>
              {group.schedule.days.join(', ')} - {group.schedule.time}
            </div>
          </div>
        )}

        {/* Próxima sesión */}
        {group.nextSession && (
          <div className="alert alert-info py-2 mb-3" style={{ fontSize: '0.8rem' }}>
            <i className="fas fa-calendar-alt me-1"></i>
            <strong>Próxima sesión:</strong> {new Date(group.nextSession).toLocaleDateString()} a las {new Date(group.nextSession).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      <div className="card-footer bg-transparent">
        <div className="d-flex justify-content-between align-items-center">
          <button className="btn btn-sm btn-outline-primary">
            <i className="fas fa-eye me-1"></i>
            Ver Detalles
          </button>
          
          {isUserMember ? (
            <span className="badge bg-success">
              <i className="fas fa-check me-1"></i>
              Miembro
            </span>
          ) : canJoin ? (
            <button
              className="btn btn-sm btn-primary"
              onClick={handleJoinGroup}
              disabled={isJoining}
            >
              {isJoining ? (
                <>
                  <i className="fas fa-spinner fa-spin me-1"></i>
                  Uniéndose...
                </>
              ) : (
                <>
                  <i className="fas fa-plus me-1"></i>
                  Unirse
                </>
              )}
            </button>
          ) : (
            <span className="badge bg-secondary">
              {group.status === 'full' ? 'Completo' : 
               group.status === 'private' ? 'Privado' : 'No disponible'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyGroupCard;
