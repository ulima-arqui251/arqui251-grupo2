import React, { useState } from 'react';
import PostCard from './PostCard';

const FeedSection = ({ posts, onPostInteraction, currentUser }) => {
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filterPosts = (posts) => {
    let filteredPosts = [...posts];

    // Filtrar por tipo
    if (filterType !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.type === filterType);
    }

    // Ordenar
    switch (sortBy) {
      case 'recent':
        filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        filteredPosts.sort((a, b) => b.likes - a.likes);
        break;
      case 'comments':
        filteredPosts.sort((a, b) => b.comments.length - a.comments.length);
        break;
      default:
        break;
    }

    return filteredPosts;
  };

  const filteredPosts = filterPosts(posts);

  if (posts.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-comments text-muted" style={{ fontSize: '4rem' }}></i>
        <h4 className="mt-3 text-muted">No hay publicaciones</h4>
        <p className="text-muted">¡Sé el primero en compartir algo con la comunidad!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros y ordenamiento */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="d-flex align-items-center">
            <label className="form-label me-2 mb-0">Filtrar:</label>
            <select 
              className="form-select form-select-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">Todos</option>
              <option value="question">Preguntas</option>
              <option value="discussion">Discusiones</option>
              <option value="study_material">Material de Estudio</option>
              <option value="announcement">Anuncios</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex align-items-center justify-content-md-end">
            <label className="form-label me-2 mb-0">Ordenar por:</label>
            <select 
              className="form-select form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="recent">Más recientes</option>
              <option value="popular">Más populares</option>
              <option value="comments">Más comentados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de publicaciones */}
      <div className="row">
        <div className="col-12">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No hay publicaciones que coincidan con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onInteraction={onPostInteraction}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botón para cargar más */}
      {filteredPosts.length > 0 && (
        <div className="row mt-4">
          <div className="col-12 text-center">
            <button className="btn btn-outline-primary">
              <i className="fas fa-chevron-down me-2"></i>
              Cargar más publicaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedSection;
