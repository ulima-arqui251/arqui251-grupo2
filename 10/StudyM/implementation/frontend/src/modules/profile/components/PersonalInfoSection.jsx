import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const PersonalInfoSection = ({ profileData, onUpdate, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      firstName: profileData?.firstName || '',
      lastName: profileData?.lastName || '',
      email: profileData?.email || '',
      phone: profileData?.phone || '',
      dateOfBirth: profileData?.dateOfBirth || '',
      location: profileData?.location || '',
      institution: profileData?.institution || '',
      bio: profileData?.bio || ''
    }
  });

  const onSubmit = async (data) => {
    await onUpdate(data);
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-user me-2"></i>
              Información Personal
            </h5>
            {!isEditing && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsEditing(true)}
              >
                <i className="fas fa-edit me-1"></i>
                Editar
              </button>
            )}
          </div>
          
          <div className="card-body">
            {!isEditing ? (
              // Vista de solo lectura
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Nombre</label>
                  <p className="form-control-plaintext">{profileData?.firstName || 'No especificado'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Apellido</label>
                  <p className="form-control-plaintext">{profileData?.lastName || 'No especificado'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Email</label>
                  <p className="form-control-plaintext">{profileData?.email}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Teléfono</label>
                  <p className="form-control-plaintext">{profileData?.phone || 'No especificado'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Fecha de Nacimiento</label>
                  <p className="form-control-plaintext">
                    {profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'No especificada'}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Ubicación</label>
                  <p className="form-control-plaintext">{profileData?.location || 'No especificada'}</p>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label fw-bold">Institución</label>
                  <p className="form-control-plaintext">{profileData?.institution || 'No especificada'}</p>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label fw-bold">Biografía</label>
                  <p className="form-control-plaintext">{profileData?.bio || 'No especificada'}</p>
                </div>
              </div>
            ) : (
              // Formulario de edición
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">
                      Nombre <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                      id="firstName"
                      {...register('firstName', { 
                        required: 'El nombre es requerido',
                        minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' }
                      })}
                    />
                    {errors.firstName && (
                      <div className="invalid-feedback">{errors.firstName.message}</div>
                    )}
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">
                      Apellido <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                      id="lastName"
                      {...register('lastName', { 
                        required: 'El apellido es requerido',
                        minLength: { value: 2, message: 'El apellido debe tener al menos 2 caracteres' }
                      })}
                    />
                    {errors.lastName && (
                      <div className="invalid-feedback">{errors.lastName.message}</div>
                    )}
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      {...register('email', { 
                        required: 'El email es requerido',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email inválido'
                        }
                      })}
                      disabled // No permitir cambiar email por seguridad
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email.message}</div>
                    )}
                    <div className="form-text">
                      Para cambiar tu email, contacta al soporte
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="phone"
                      {...register('phone', {
                        pattern: {
                          value: /^[\+]?[(]?[\d\s\-\(\)]{8,}$/,
                          message: 'Formato de teléfono inválido'
                        }
                      })}
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone.message}</div>
                    )}
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="dateOfBirth" className="form-label">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      className="form-control"
                      id="dateOfBirth"
                      {...register('dateOfBirth')}
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="location" className="form-label">Ubicación</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      placeholder="Ciudad, País"
                      {...register('location')}
                    />
                  </div>
                  
                  <div className="col-12 mb-3">
                    <label htmlFor="institution" className="form-label">Institución</label>
                    <input
                      type="text"
                      className="form-control"
                      id="institution"
                      placeholder="Universidad, Colegio, etc."
                      {...register('institution')}
                    />
                  </div>
                  
                  <div className="col-12 mb-3">
                    <label htmlFor="bio" className="form-label">Biografía</label>
                    <textarea
                      className="form-control"
                      id="bio"
                      rows="3"
                      placeholder="Cuéntanos un poco sobre ti..."
                      {...register('bio')}
                    ></textarea>
                  </div>
                </div>
                
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-1"></i>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-1"></i>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
