import React, { useState } from 'react';

const CreateGroupModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    level: 'beginner',
    maxMembers: 10,
    status: 'open',
    schedule: {
      days: [],
      time: '',
      timezone: 'America/Lima'
    },
    goals: [],
    rules: ''
  });

  const [goalInput, setGoalInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjects = [
    'Matemáticas', 'Física', 'Química', 'Biología', 'Historia',
    'Literatura', 'Inglés', 'Programación', 'Arquitectura', 'Medicina',
    'Derecho', 'Psicología', 'Economía', 'Administración', 'Otros'
  ];

  const levels = [
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' },
    { value: 'university', label: 'Universitario' },
    { value: 'postgraduate', label: 'Postgrado' }
  ];

  const daysOfWeek = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'days') {
      const days = checked 
        ? [...formData.schedule.days, value]
        : formData.schedule.days.filter(day => day !== value);
      
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          days
        }
      }));
    } else if (name === 'time') {
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          time: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const handleAddGoal = () => {
    const goal = goalInput.trim();
    if (goal && !formData.goals.includes(goal)) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, goal]
      }));
      setGoalInput('');
    }
  };

  const handleRemoveGoal = (goalToRemove) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal !== goalToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.subject) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error creating group:', error);
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
              <i className="fas fa-users me-2"></i>
              Crear Grupo de Estudio
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Información básica */}
              <div className="row">
                <div className="col-md-8 mb-3">
                  <label htmlFor="name" className="form-label fw-bold">
                    Nombre del grupo <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Grupo de Estudios de Cálculo I"
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="maxMembers" className="form-label fw-bold">
                    Máx. miembros
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="maxMembers"
                    name="maxMembers"
                    value={formData.maxMembers}
                    onChange={handleInputChange}
                    min="2"
                    max="50"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label fw-bold">
                  Descripción <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe el propósito y objetivos del grupo..."
                  required
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="subject" className="form-label fw-bold">
                    Materia <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona una materia</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="level" className="form-label fw-bold">
                    Nivel
                  </label>
                  <select
                    className="form-select"
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                  >
                    {levels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Horario */}
              <div className="mb-4">
                <label className="form-label fw-bold">Horario de estudio</label>
                <div className="row">
                  <div className="col-md-8 mb-2">
                    <label className="form-label">Días de la semana</label>
                    <div className="d-flex flex-wrap gap-2">
                      {daysOfWeek.map(day => (
                        <div key={day.value} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="days"
                            value={day.value}
                            id={`day-${day.value}`}
                            checked={formData.schedule.days.includes(day.value)}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor={`day-${day.value}`}>
                            {day.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-4 mb-2">
                    <label htmlFor="time" className="form-label">Hora</label>
                    <input
                      type="time"
                      className="form-control"
                      id="time"
                      name="time"
                      value={formData.schedule.time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Objetivos */}
              <div className="mb-3">
                <label className="form-label fw-bold">Objetivos del grupo</label>
                <div className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="Agregar un objetivo..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGoal())}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleAddGoal}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                {formData.goals.length > 0 && (
                  <div>
                    {formData.goals.map((goal, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-1">
                        <span>{goal}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveGoal(goal)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reglas */}
              <div className="mb-3">
                <label htmlFor="rules" className="form-label fw-bold">
                  Reglas del grupo (opcional)
                </label>
                <textarea
                  className="form-control"
                  id="rules"
                  name="rules"
                  rows="3"
                  value={formData.rules}
                  onChange={handleInputChange}
                  placeholder="Establece las reglas y expectativas para los miembros del grupo..."
                ></textarea>
              </div>

              {/* Configuración de privacidad */}
              <div className="mb-3">
                <label htmlFor="status" className="form-label fw-bold">
                  Configuración de privacidad
                </label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="open">Abierto - Cualquiera puede unirse</option>
                  <option value="private">Privado - Solo por invitación</option>
                </select>
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
                disabled={isSubmitting || !formData.name.trim() || !formData.description.trim() || !formData.subject}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Creando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-users me-2"></i>
                    Crear Grupo
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

export default CreateGroupModal;
