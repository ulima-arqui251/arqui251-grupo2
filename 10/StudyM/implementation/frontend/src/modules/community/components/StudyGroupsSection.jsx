import React, { useState } from 'react';
import StudyGroupCard from './StudyGroupCard';
import CreateGroupModal from './CreateGroupModal';

const StudyGroupsSection = ({ studyGroups, onJoinGroup, currentUser }) => {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filterAndSortGroups = (groups) => {
    let filteredGroups = [...groups];

    // Filtrar por materia
    if (filterSubject !== 'all') {
      filteredGroups = filteredGroups.filter(group => 
        group.subject === filterSubject
      );
    }

    // Filtrar por nivel
    if (filterLevel !== 'all') {
      filteredGroups = filteredGroups.filter(group => 
        group.level === filterLevel
      );
    }

    // Ordenar
    switch (sortBy) {
      case 'recent':
        filteredGroups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'members':
        filteredGroups.sort((a, b) => b.memberCount - a.memberCount);
        break;
      case 'active':
        filteredGroups.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
        break;
      default:
        break;
    }

    return filteredGroups;
  };

  const filteredGroups = filterAndSortGroups(studyGroups);

  // Obtener materias únicas
  const subjects = [...new Set(studyGroups.map(group => group.subject))];
  const levels = [...new Set(studyGroups.map(group => group.level))];

  if (studyGroups.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-users text-muted" style={{ fontSize: '4rem' }}></i>
        <h4 className="mt-3 text-muted">No hay grupos de estudio</h4>
        <p className="text-muted">¡Crea el primer grupo de estudio de tu materia!</p>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => setShowCreateGroup(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Crear Grupo de Estudio
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header con botón de crear grupo */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <i className="fas fa-users text-primary me-2"></i>
              Grupos de Estudio
            </h4>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateGroup(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Crear Grupo
            </button>
          </div>
        </div>
      </div>

      {/* Filtros y ordenamiento */}
      <div className="row mb-4">
        <div className="col-md-3">
          <label className="form-label">Materia</label>
          <select 
            className="form-select"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="all">Todas las materias</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Nivel</label>
          <select 
            className="form-select"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="all">Todos los niveles</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Ordenar por</label>
          <select 
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Más recientes</option>
            <option value="members">Más miembros</option>
            <option value="active">Más activos</option>
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <div className="text-muted">
            <small>{filteredGroups.length} grupos encontrados</small>
          </div>
        </div>
      </div>

      {/* Lista de grupos */}
      <div className="row">
        {filteredGroups.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-4">
              <p className="text-muted">No hay grupos que coincidan con los filtros seleccionados.</p>
            </div>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.id} className="col-md-6 col-lg-4 mb-4">
              <StudyGroupCard
                group={group}
                currentUser={currentUser}
                onJoinGroup={onJoinGroup}
              />
            </div>
          ))
        )}
      </div>

      {/* Modal para crear grupo */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onSubmit={(groupData) => {
            console.log('Create group:', groupData);
            setShowCreateGroup(false);
          }}
        />
      )}
    </div>
  );
};

export default StudyGroupsSection;
