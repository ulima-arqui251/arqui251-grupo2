import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNotifications } from '../../../shared/context/NotificationContext';
import { authAPI } from '../../../shared/services/authService';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import PersonalInfoSection from '../components/PersonalInfoSection';
import SecuritySection from '../components/SecuritySection';
import PreferencesSection from '../components/PreferencesSection';
import StatsSection from '../components/StatsSection';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotifications();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      // En desarrollo, usar datos del usuario actual
      if (user) {
        setProfileData({
          ...user,
          phone: user.phone || '',
          dateOfBirth: user.dateOfBirth || '',
          location: user.location || '',
          bio: user.bio || '',
          preferences: user.preferences || {
            notifications: true,
            emailUpdates: true,
            darkMode: false,
            language: 'es'
          }
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showNotification('Error al cargar el perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      setLoading(true);
      
      // Simular actualización en desarrollo
      if (import.meta.env.MODE === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProfileData(prev => ({ ...prev, ...updatedData }));
        updateUser({ ...user, ...updatedData });
        showNotification('Perfil actualizado exitosamente', 'success');
        return;
      }

      // Llamada real a la API
      const response = await authAPI.updateProfile(updatedData);
      setProfileData(response.data);
      updateUser(response.data);
      showNotification('Perfil actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Error al actualizar el perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (passwordData) => {
    try {
      setLoading(true);
      
      if (import.meta.env.MODE === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        showNotification('Contraseña cambiada exitosamente', 'success');
        return;
      }

      await authAPI.changePassword(passwordData);
      showNotification('Contraseña cambiada exitosamente', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification('Error al cambiar la contraseña', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData) {
    return (
      <div className="container-fluid py-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center">
            <div className="me-3">
              <img
                src={profileData?.avatar || `https://ui-avatars.com/api/?name=${profileData?.firstName || 'Usuario'}&background=007bff&color=fff&size=80`}
                alt="Profile"
                className="rounded-circle"
                style={{ width: '80px', height: '80px' }}
              />
            </div>
            <div>
              <h1 className="h3 mb-0">
                {profileData?.firstName} {profileData?.lastName}
              </h1>
              <p className="text-muted mb-0">{profileData?.email}</p>
              <p className="text-muted mb-0">
                <i className="fas fa-graduation-cap me-1"></i>
                {profileData?.institution || 'Institución no especificada'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <i className="fas fa-user me-2"></i>
                Información Personal
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <i className="fas fa-shield-alt me-2"></i>
                Seguridad
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                <i className="fas fa-cog me-2"></i>
                Preferencias
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                <i className="fas fa-chart-bar me-2"></i>
                Estadísticas
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'personal' && (
          <PersonalInfoSection
            profileData={profileData}
            onUpdate={handleUpdateProfile}
            loading={loading}
          />
        )}

        {activeTab === 'security' && (
          <SecuritySection
            user={profileData}
            onChangePassword={handleChangePassword}
            loading={loading}
          />
        )}

        {activeTab === 'preferences' && (
          <PreferencesSection
            preferences={profileData?.preferences || {}}
            onUpdate={handleUpdateProfile}
            loading={loading}
          />
        )}

        {activeTab === 'stats' && (
          <StatsSection
            user={profileData}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
