import React, { useState } from 'react';

const PostCard = ({ post, currentUser, onInteraction }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);

  const getPostTypeIcon = (type) => {
    const icons = {
      'question': 'fas fa-question-circle text-info',
      'discussion': 'fas fa-comments text-primary',
      'study_material': 'fas fa-book text-success',
      'announcement': 'fas fa-bullhorn text-warning',
      'default': 'fas fa-comment text-secondary'
    };
    return icons[type] || icons.default;
  };

  const getPostTypeLabel = (type) => {
    const labels = {
      'question': 'Pregunta',
      'discussion': 'Discusión',
      'study_material': 'Material de Estudio',
      'announcement': 'Anuncio',
      'default': 'Publicación'
    };
    return labels[type] || labels.default;
  };

  const handleLike = async () => {
    try {
      await onInteraction(post.id, 'like');
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await onInteraction(post.id, 'comment', { content: newComment });
      setNewComment('');
      // Aquí podrías actualizar los comentarios localmente
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        {/* Header del post */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            <img
              src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.username}&background=007bff&color=fff`}
              alt={post.author.username}
              className="rounded-circle me-3"
              style={{ width: '48px', height: '48px' }}
            />
            <div>
              <h6 className="mb-0">{post.author.username}</h6>
              <small className="text-muted">
                {post.author.institution} • {formatTimeAgo(post.createdAt)}
              </small>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <span className="badge bg-light text-dark me-2">
              <i className={getPostTypeIcon(post.type)} style={{ fontSize: '0.8rem' }}></i>
              <span className="ms-1">{getPostTypeLabel(post.type)}</span>
            </span>
            <div className="dropdown">
              <button 
                className="btn btn-sm btn-light"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i className="fas fa-ellipsis-h"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><a className="dropdown-item" href="#"><i className="fas fa-flag me-2"></i>Reportar</a></li>
                {post.author.id === currentUser?.id && (
                  <>
                    <li><a className="dropdown-item" href="#"><i className="fas fa-edit me-2"></i>Editar</a></li>
                    <li><a className="dropdown-item text-danger" href="#"><i className="fas fa-trash me-2"></i>Eliminar</a></li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Contenido del post */}
        <div className="mb-3">
          {post.title && (
            <h5 className="card-title">{post.title}</h5>
          )}
          <p className="card-text">{post.content}</p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="mb-2">
              {post.tags.map((tag, index) => (
                <span key={index} className="badge bg-primary me-1">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {post.attachments && post.attachments.length > 0 && (
            <div className="mb-2">
              {post.attachments.map((attachment, index) => (
                <div key={index} className="border rounded p-2 mb-2">
                  <i className="fas fa-paperclip me-2"></i>
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                    {attachment.name}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones del post */}
        <div className="d-flex justify-content-between align-items-center border-top pt-3">
          <div className="d-flex gap-3">
            <button
              className={`btn btn-sm ${isLiked ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={handleLike}
            >
              <i className={`fas fa-heart me-1 ${isLiked ? 'text-white' : ''}`}></i>
              {likesCount} Me gusta
            </button>
            
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowComments(!showComments)}
            >
              <i className="fas fa-comment me-1"></i>
              {post.comments?.length || 0} Comentarios
            </button>
            
            <button className="btn btn-sm btn-outline-secondary">
              <i className="fas fa-share me-1"></i>
              Compartir
            </button>
          </div>
          
          <button className="btn btn-sm btn-outline-warning">
            <i className="fas fa-bookmark me-1"></i>
            Guardar
          </button>
        </div>

        {/* Sección de comentarios */}
        {showComments && (
          <div className="border-top pt-3 mt-3">
            {/* Nuevo comentario */}
            <div className="d-flex mb-3">
              <img
                src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.username}&background=007bff&color=fff`}
                alt={currentUser?.username}
                className="rounded-circle me-2"
                style={{ width: '32px', height: '32px' }}
              />
              <div className="flex-grow-1">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de comentarios */}
            {post.comments && post.comments.length > 0 && (
              <div className="comments-list">
                {post.comments.map((comment, index) => (
                  <div key={index} className="d-flex mb-3">
                    <img
                      src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.username}&background=007bff&color=fff`}
                      alt={comment.author.username}
                      className="rounded-circle me-2"
                      style={{ width: '32px', height: '32px' }}
                    />
                    <div className="flex-grow-1">
                      <div className="bg-light rounded p-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <strong className="text-sm">{comment.author.username}</strong>
                          <small className="text-muted">{formatTimeAgo(comment.createdAt)}</small>
                        </div>
                        <p className="mb-0 text-sm">{comment.content}</p>
                      </div>
                      <div className="d-flex gap-2 mt-1">
                        <button className="btn btn-sm btn-link p-0 text-muted">
                          <i className="fas fa-heart me-1"></i>
                          Me gusta
                        </button>
                        <button className="btn btn-sm btn-link p-0 text-muted">
                          Responder
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
