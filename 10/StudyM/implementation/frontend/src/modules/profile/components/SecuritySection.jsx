import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const SecuritySection = ({ user, onChangePassword, loading }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    await onChangePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
    reset();
    setShowChangePassword(false);
  };

  const handleCancel = () => {
    reset();
    setShowChangePassword(false);
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-shield-alt me-2"></i>
              Seguridad de la Cuenta
            </h5>
          </div>
          
          <div className="card-body">
            {/* Información de la cuenta */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h6 className="fw-bold">Estado de la Cuenta</h6>
                <div className="d-flex align-items-center mb-2">
                  <span className="badge bg-success me-2">
                    <i className="fas fa-check"></i>
                  </span>
                  <span>Cuenta verificada</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <span className="badge bg-info me-2">
                    <i className="fas fa-envelope"></i>
                  </span>
                  <span>Email verificado</span>
                </div>
                {user?.twoFactorEnabled && (
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge bg-warning me-2">
                      <i className="fas fa-mobile-alt"></i>
                    </span>
                    <span>Autenticación de dos factores activada</span>
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold">Última Actividad</h6>
                <p className="text-muted">
                  <i className="fas fa-clock me-1"></i>
                  Última sesión: {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'No disponible'}
                </p>
                <p className="text-muted">
                  <i className="fas fa-map-marker-alt me-1"></i>
                  Ubicación: {user?.lastLoginLocation || 'No disponible'}
                </p>
              </div>
            </div>

            {/* Cambiar contraseña */}
            <div className="border-top pt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="fw-bold">Contraseña</h6>
                  <p className="text-muted mb-0">
                    Última actualización: {user?.passwordUpdatedAt ? new Date(user.passwordUpdatedAt).toLocaleDateString() : 'No disponible'}
                  </p>
                </div>
                {!showChangePassword && (
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setShowChangePassword(true)}
                  >
                    <i className="fas fa-key me-1"></i>
                    Cambiar Contraseña
                  </button>
                )}
              </div>

              {showChangePassword && (
                <div className="card bg-light">
                  <div className="card-body">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="mb-3">
                        <label htmlFor="currentPassword" className="form-label">
                          Contraseña Actual <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                          id="currentPassword"
                          {...register('currentPassword', { 
                            required: 'La contraseña actual es requerida'
                          })}
                        />
                        {errors.currentPassword && (
                          <div className="invalid-feedback">{errors.currentPassword.message}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="newPassword" className="form-label">
                          Nueva Contraseña <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                          id="newPassword"
                          {...register('newPassword', { 
                            required: 'La nueva contraseña es requerida',
                            minLength: { value: 8, message: 'La contraseña debe tener al menos 8 caracteres' },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                              message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
                            }
                          })}
                        />
                        {errors.newPassword && (
                          <div className="invalid-feedback">{errors.newPassword.message}</div>
                        )}
                        <div className="form-text">
                          La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos.
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirmar Nueva Contraseña <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          id="confirmPassword"
                          {...register('confirmPassword', { 
                            required: 'Confirma tu nueva contraseña',
                            validate: value => value === newPassword || 'Las contraseñas no coinciden'
                          })}
                        />
                        {errors.confirmPassword && (
                          <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                        )}
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
                              Cambiando...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-1"></i>
                              Cambiar Contraseña
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
                  </div>
                </div>
              )}
            </div>

            {/* Autenticación de dos factores */}
            <div className="border-top pt-4 mt-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold">Autenticación de Dos Factores (2FA)</h6>
                  <p className="text-muted mb-0">
                    Añade una capa extra de seguridad a tu cuenta
                  </p>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="twoFactorSwitch"
                    checked={user?.twoFactorEnabled || false}
                    onChange={() => {
                      // Aquí implementarías la lógica para activar/desactivar 2FA
                      console.log('Toggle 2FA');
                    }}
                  />
                  <label className="form-check-label" htmlFor="twoFactorSwitch">
                    {user?.twoFactorEnabled ? 'Activado' : 'Desactivado'}
                  </label>
                </div>
              </div>
              
              {user?.twoFactorEnabled && (
                <div className="alert alert-info mt-3">
                  <i className="fas fa-info-circle me-2"></i>
                  La autenticación de dos factores está activada. Necesitarás tu código de autenticación para iniciar sesión.
                </div>
              )}
            </div>

            {/* Sesiones activas */}
            <div className="border-top pt-4 mt-4">
              <h6 className="fw-bold mb-3">Sesiones Activas</h6>
              <div className="list-group">
                <div className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">
                        <i className="fas fa-desktop me-2"></i>
                        Sesión Actual
                      </h6>
                      <p className="mb-1">Windows • Chrome</p>
                      <small className="text-muted">Activa ahora</small>
                    </div>
                    <span className="badge bg-success">Actual</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <button className="btn btn-outline-danger btn-sm">
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Cerrar Todas las Sesiones
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
