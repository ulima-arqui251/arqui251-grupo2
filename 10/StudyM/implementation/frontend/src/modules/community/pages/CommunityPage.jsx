import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNotifications } from '../../../shared/context/NotificationContext';
import { communityService } from '../../../shared/services/communityService';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import FeedSection from '../components/FeedSection';
import StudyGroupsSection from '../components/StudyGroupsSection';
import CreatePostModal from '../components/CreatePostModal';

const CommunityPage = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadCommunityData();
  }, [refreshKey]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'feed') {
        const postsResponse = await communityService.getFeed();
        setPosts(postsResponse.data);
      } else if (activeTab === 'groups') {
        const groupsResponse = await communityService.getStudyGroups();
        setStudyGroups(groupsResponse.data);
      }
    } catch (error) {
      console.error('Error loading community data:', error);
      showNotification('Error al cargar los datos de la comunidad', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      await communityService.createPost(postData);
      showNotification('Publicación creada exitosamente', 'success');
      setShowCreatePost(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error creating post:', error);
      showNotification('Error al crear la publicación', 'error');
    }
  };

  const handlePostInteraction = async (postId, action) => {
    try {
      await communityService.interactWithPost(postId, action);
      // Actualizar la lista de posts
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error interacting with post:', error);
      showNotification('Error al interactuar con la publicación', 'error');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await communityService.joinStudyGroup(groupId);
      showNotification('Te has unido al grupo exitosamente', 'success');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error joining group:', error);
      showNotification('Error al unirse al grupo', 'error');
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                <i className="fas fa-users text-primary me-2"></i>
                Comunidad StudyMate
              </h1>
              <p className="text-muted mb-0">
                Conecta con otros estudiantes y forma grupos de estudio
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreatePost(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Nueva Publicación
            </button>
          </div>
        </div>
      </div>

      {/* Navegación de pestañas */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills nav-justified">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'feed' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('feed');
                  setRefreshKey(prev => prev + 1);
                }}
              >
                <i className="fas fa-home me-2"></i>
                Feed
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'groups' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('groups');
                  setRefreshKey(prev => prev + 1);
                }}
              >
                <i className="fas fa-users me-2"></i>
                Grupos de Estudio
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'discussions' ? 'active' : ''}`}
                onClick={() => setActiveTab('discussions')}
              >
                <i className="fas fa-comments me-2"></i>
                Discusiones
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Contenido según pestaña activa */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="tab-content">
          {activeTab === 'feed' && (
            <FeedSection
              posts={posts}
              onPostInteraction={handlePostInteraction}
              currentUser={user}
            />
          )}

          {activeTab === 'groups' && (
            <StudyGroupsSection
              studyGroups={studyGroups}
              onJoinGroup={handleJoinGroup}
              currentUser={user}
            />
          )}

          {activeTab === 'discussions' && (
            <div className="text-center py-5">
              <i className="fas fa-comments text-muted" style={{ fontSize: '4rem' }}></i>
              <h4 className="mt-3 text-muted">Discusiones</h4>
              <p className="text-muted">Esta sección estará disponible pronto</p>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear publicación */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </div>
  );
};

export default CommunityPage;
