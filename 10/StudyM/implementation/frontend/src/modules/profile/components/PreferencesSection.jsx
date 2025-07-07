import React, { useState } from 'react';

const PreferencesSection = ({ preferences, onUpdate, loading }) => {
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  const handlePreferenceChange = (key, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onUpdate({ preferences: localPreferences });
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-cog me-2"></i>
              Preferencias de la Aplicación
            </h5>
            {hasChanges && (
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
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
                      Guardar
                    </>
                  )}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Descartar
                </button>
              </div>
            )}
          </div>
          
          <div className="card-body">
            {/* Notificaciones */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3">
                <i className="fas fa-bell me-2 text-primary"></i>
                Notificaciones
              </h6>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="notifications"
                      checked={localPreferences.notifications || false}
                      onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="notifications">
                      <strong>Notificaciones en la app</strong>
                      <div className="text-muted small">Recibir notificaciones mientras usas StudyMate</div>
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="emailUpdates"
                      checked={localPreferences.emailUpdates || false}
                      onChange={(e) => handlePreferenceChange('emailUpdates', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="emailUpdates">
                      <strong>Actualizaciones por email</strong>
                      <div className="text-muted small">Recibir noticias y actualizaciones importantes</div>
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="lessonReminders"
                      checked={localPreferences.lessonReminders || false}
                      onChange={(e) => handlePreferenceChange('lessonReminders', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="lessonReminders">
                      <strong>Recordatorios de lecciones</strong>
                      <div className="text-muted small">Recordar cuando hay nuevas lecciones disponibles</div>
                    </label>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="achievementNotifications"
                      checked={localPreferences.achievementNotifications || false}
                      onChange={(e) => handlePreferenceChange('achievementNotifications', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="achievementNotifications">
                      <strong>Notificaciones de logros</strong>
                      <div className="text-muted small">Ser notificado cuando desbloquees logros</div>
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="communityUpdates"
                      checked={localPreferences.communityUpdates || false}
                      onChange={(e) => handlePreferenceChange('communityUpdates', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="communityUpdates">
                      <strong>Actualizaciones de comunidad</strong>
                      <div className="text-muted small">Notificaciones sobre grupos de estudio y publicaciones</div>
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="weeklyReports"
                      checked={localPreferences.weeklyReports || false}
                      onChange={(e) => handlePreferenceChange('weeklyReports', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="weeklyReports">
                      <strong>Reporte semanal</strong>
                      <div className="text-muted small">Resumen de tu progreso cada semana</div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Apariencia */}
            <div className="border-top pt-4 mb-4">
              <h6 className="fw-bold mb-3">
                <i className="fas fa-palette me-2 text-primary"></i>
                Apariencia
              </h6>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Tema</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="theme"
                        id="lightTheme"
                        checked={!localPreferences.darkMode}
                        onChange={() => handlePreferenceChange('darkMode', false)}
                      />
                      <label className="form-check-label" htmlFor="lightTheme">
                        <i className="fas fa-sun me-2 text-warning"></i>
                        Tema claro
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="theme"
                        id="darkTheme"
                        checked={localPreferences.darkMode || false}
                        onChange={() => handlePreferenceChange('darkMode', true)}
                      />
                      <label className="form-check-label" htmlFor="darkTheme">
                        <i className="fas fa-moon me-2 text-primary"></i>
                        Tema oscuro
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="language" className="form-label">Idioma</label>
                    <select
                      className="form-select"
                      id="language"
                      value={localPreferences.language || 'es'}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Estudio */}
            <div className="border-top pt-4 mb-4">
              <h6 className="fw-bold mb-3">
                <i className="fas fa-graduation-cap me-2 text-primary"></i>
                Configuración de Estudio
              </h6>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="studyGoal" className="form-label">Meta diaria de estudio (minutos)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="studyGoal"
                      min="15"
                      max="480"
                      step="15"
                      value={localPreferences.dailyStudyGoal || 60}
                      onChange={(e) => handlePreferenceChange('dailyStudyGoal', parseInt(e.target.value))}
                    />
                    <div className="form-text">Establece tu objetivo diario de tiempo de estudio</div>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="autoProgress"
                      checked={localPreferences.autoProgress || false}
                      onChange={(e) => handlePreferenceChange('autoProgress', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="autoProgress">
                      <strong>Progreso automático</strong>
                      <div className="text-muted small">Avanzar automáticamente a la siguiente lección</div>
                    </label>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="reminderTime" className="form-label">Hora de recordatorio</label>
                    <input
                      type="time"
                      className="form-control"
                      id="reminderTime"
                      value={localPreferences.reminderTime || '19:00'}
                      onChange={(e) => handlePreferenceChange('reminderTime', e.target.value)}
                    />
                    <div className="form-text">Hora preferida para recibir recordatorios</div>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="showHints"
                      checked={localPreferences.showHints !== false}
                      onChange={(e) => handlePreferenceChange('showHints', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="showHints">
                      <strong>Mostrar pistas</strong>
                      <div className="text-muted small">Mostrar pistas durante las lecciones</div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacidad */}
            <div className="border-top pt-4">
              <h6 className="fw-bold mb-3">
                <i className="fas fa-user-shield me-2 text-primary"></i>
                Privacidad
              </h6>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="profilePublic"
                      checked={localPreferences.profilePublic || false}
                      onChange={(e) => handlePreferenceChange('profilePublic', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="profilePublic">
                      <strong>Perfil público</strong>
                      <div className="text-muted small">Permitir que otros vean tu perfil y progreso</div>
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="showInLeaderboard"
                      checked={localPreferences.showInLeaderboard !== false}
                      onChange={(e) => handlePreferenceChange('showInLeaderboard', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="showInLeaderboard">
                      <strong>Aparecer en ranking</strong>
                      <div className="text-muted small">Mostrar tu posición en los rankings públicos</div>
                    </label>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="allowDataAnalytics"
                      checked={localPreferences.allowDataAnalytics !== false}
                      onChange={(e) => handlePreferenceChange('allowDataAnalytics', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="allowDataAnalytics">
                      <strong>Análisis de datos</strong>
                      <div className="text-muted small">Permitir análisis para mejorar la experiencia</div>
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="marketingEmails"
                      checked={localPreferences.marketingEmails || false}
                      onChange={(e) => handlePreferenceChange('marketingEmails', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="marketingEmails">
                      <strong>Emails promocionales</strong>
                      <div className="text-muted small">Recibir ofertas y promociones especiales</div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;
