import React, { useState } from 'react';

const CreatePostModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'discussion',
    title: '',
    content: '',
    tags: [],
    attachments: []
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postTypes = {
    'discussion': { label: 'Discusión', icon: 'fas fa-comments', color: 'primary' },
    'question': { label: 'Pregunta', icon: 'fas fa-question-circle', color: 'info' },
    'study_material': { label: 'Material de Estudio', icon: 'fas fa-book', color: 'success' },
    'announcement': { label: 'Anuncio', icon: 'fas fa-bullhorn', color: 'warning' }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    // Aquí podrías implementar la subida de archivos
    console.log('Files to upload:', files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-plus-circle me-2"></i>
              Nueva Publicación
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Tipo de publicación */}
              <div className="mb-4">
                <label className="form-label fw-bold">Tipo de publicación</label>
                <div className="row">
                  {Object.entries(postTypes).map(([key, type]) => (
                    <div key={key} className="col-6 col-md-3 mb-2">
                      <input
                        type="radio"
                        className="btn-check"
                        name="type"
                        id={`type-${key}`}
                        value={key}
                        checked={formData.type === key}
                        onChange={handleInputChange}
                      />
                      <label 
                        className={`btn btn-outline-${type.color} w-100`}
                        htmlFor={`type-${key}`}
                      >
                        <i className={`${type.icon} d-block mb-1`}></i>
                        <small>{type.label}</small>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Título (opcional para algunos tipos) */}
              {(formData.type === 'question' || formData.type === 'announcement') && (
                <div className="mb-3">
                  <label htmlFor="title" className="form-label fw-bold">
                    Título {formData.type === 'question' && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder={
                      formData.type === 'question' 
                        ? '¿Cuál es tu pregunta?' 
                        : 'Título del anuncio'
                    }
                    required={formData.type === 'question'}
                  />
                </div>
              )}

              {/* Contenido */}
              <div className="mb-3">
                <label htmlFor="content" className="form-label fw-bold">
                  Contenido <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  id="content"
                  name="content"
                  rows="6"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Comparte tus ideas, dudas o conocimientos con la comunidad..."
                  required
                ></textarea>
                <div className="form-text">
                  {formData.content.length}/1000 caracteres
                </div>
              </div>

              {/* Tags */}
              <div className="mb-3">
                <label className="form-label fw-bold">Etiquetas</label>
                <div className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleAddTag}
                    placeholder="Agregar etiqueta (presiona Enter)"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleAddTag}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="d-flex flex-wrap gap-1">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="badge bg-primary">
                        #{tag}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-1"
                          style={{ fontSize: '0.6rem' }}
                          onClick={() => handleRemoveTag(tag)}
                        ></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="form-text">
                  Las etiquetas ayudan a otros estudiantes a encontrar tu publicación
                </div>
              </div>

              {/* Archivos adjuntos */}
              <div className="mb-3">
                <label htmlFor="attachments" className="form-label fw-bold">
                  Archivos adjuntos (opcional)
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="attachments"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileUpload}
                />
                <div className="form-text">
                  Puedes adjuntar documentos, imágenes o materiales de estudio (máx. 10MB por archivo)
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !formData.content.trim()}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Publicando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane me-2"></i>
                    Publicar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
