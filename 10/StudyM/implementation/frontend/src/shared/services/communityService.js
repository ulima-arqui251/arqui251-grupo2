import apiManager from './apiManager'

// Mock data for development
const mockPosts = [
  {
    id: 1,
    type: 'question',
    title: '¿Cómo resolver integrales por partes?',
    content: 'Estoy teniendo dificultades con las integrales por partes. ¿Alguien podría explicarme el método paso a paso?',
    author: {
      id: 1,
      username: 'estudiante123',
      avatar: null,
      institution: 'Universidad Nacional'
    },
    likes: 15,
    isLiked: false,
    comments: [
      {
        id: 1,
        content: 'La fórmula es ∫u dv = uv - ∫v du. Primero debes elegir qué función será u y cuál será dv.',
        author: {
          id: 2,
          username: 'tutor_mate',
          avatar: null,
          institution: 'Universidad Privada'
        },
        createdAt: '2024-01-20T14:30:00Z'
      }
    ],
    tags: ['matematicas', 'calculo', 'integrales'],
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-01-20T12:00:00Z'
  },
  {
    id: 2,
    type: 'discussion',
    title: null,
    content: 'Acabo de terminar mi primera semana estudiando con StudyMate. ¡Los resultados son increíbles! Mi comprensión ha mejorado significativamente.',
    author: {
      id: 3,
      username: 'ana_estudiante',
      avatar: null,
      institution: 'Instituto Tecnológico'
    },
    likes: 8,
    isLiked: true,
    comments: [
      {
        id: 2,
        content: '¡Felicidades! Es genial escuchar historias de éxito.',
        author: {
          id: 4,
          username: 'carlos_estud',
          avatar: null,
          institution: 'Universidad Nacional'
        },
        createdAt: '2024-01-20T16:00:00Z'
      }
    ],
    tags: ['experiencia', 'motivacion'],
    createdAt: '2024-01-20T15:30:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: 3,
    type: 'study_material',
    title: 'Resumen de Química Orgánica',
    content: 'Comparto mi resumen de los grupos funcionales más importantes en química orgánica. Espero que les sea útil para sus estudios.',
    author: {
      id: 5,
      username: 'quimica_pro',
      avatar: null,
      institution: 'Universidad de Ciencias'
    },
    likes: 23,
    isLiked: false,
    comments: [],
    tags: ['quimica', 'organica', 'resumen'],
    attachments: [
      {
        id: 1,
        name: 'grupos-funcionales.pdf',
        url: '#',
        type: 'pdf'
      }
    ],
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z'
  }
];

const mockStudyGroups = [
  {
    id: 1,
    name: 'Grupo de Cálculo Avanzado',
    description: 'Nos enfocamos en resolver problemas complejos de cálculo diferencial e integral. Sesiones de estudio colaborativo.',
    subject: 'Matemáticas',
    level: 'advanced',
    status: 'open',
    memberCount: 8,
    maxMembers: 12,
    creator: {
      id: 1,
      username: 'prof_martinez',
      avatar: null,
      institution: 'Universidad Nacional'
    },
    members: [
      { id: 1, username: 'estudiante1' },
      { id: 2, username: 'estudiante2' }
    ],
    goals: [
      'Dominar técnicas de integración',
      'Resolver problemas de aplicación',
      'Prepararse para exámenes'
    ],
    schedule: {
      days: ['tuesday', 'thursday'],
      time: '19:00',
      timezone: 'America/Lima'
    },
    nextSession: '2024-01-23T19:00:00Z',
    lastActivity: '2024-01-20T10:00:00Z',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Física Cuántica para Principiantes',
    description: 'Introducción a los conceptos básicos de la mecánica cuántica. Ideal para estudiantes que inician en el tema.',
    subject: 'Física',
    level: 'beginner',
    status: 'open',
    memberCount: 5,
    maxMembers: 10,
    creator: {
      id: 2,
      username: 'fisica_fan',
      avatar: null,
      institution: 'Universidad de Ciencias'
    },
    members: [
      { id: 3, username: 'estudiante3' }
    ],
    goals: [
      'Entender conceptos básicos',
      'Resolver ejercicios introductorios'
    ],
    schedule: {
      days: ['monday', 'wednesday'],
      time: '18:00',
      timezone: 'America/Lima'
    },
    nextSession: '2024-01-22T18:00:00Z',
    lastActivity: '2024-01-19T15:30:00Z',
    createdAt: '2024-01-10T14:00:00Z'
  },
  {
    id: 3,
    name: 'Programación en Python',
    description: 'Grupo para aprender Python desde cero. Incluye ejercicios prácticos y proyectos colaborativos.',
    subject: 'Programación',
    level: 'intermediate',
    status: 'open',
    memberCount: 12,
    maxMembers: 15,
    creator: {
      id: 3,
      username: 'dev_python',
      avatar: null,
      institution: 'Instituto Tecnológico'
    },
    members: [],
    goals: [
      'Aprender sintaxis básica',
      'Crear proyectos prácticos',
      'Prepararse para certificaciones'
    ],
    schedule: {
      days: ['saturday'],
      time: '10:00',
      timezone: 'America/Lima'
    },
    nextSession: '2024-01-27T10:00:00Z',
    lastActivity: '2024-01-20T20:00:00Z',
    createdAt: '2024-01-05T09:00:00Z'
  }
];

// Community service
export const communityService = {
  // Posts
  getFeed: async (params = {}) => {
    try {
      const response = await apiManager.request('/community/posts', { params });
      return response;
    } catch (error) {
      console.error('Error getting feed:', error);
      return { data: mockPosts };
    }
  },

  getPost: async (postId) => {
    try {
      const response = await apiManager.request(`/community/posts/${postId}`);
      return response;
    } catch (error) {
      console.error('Error getting post:', error);
      // Fallback to mock data
      const post = mockPosts.find(p => p.id === parseInt(postId));
      if (post) {
        return { data: post };
      }
      throw error;
    }
  },

  createPost: async (postData) => {
    try {
      const response = await apiManager.request('/community/posts', {
        method: 'POST',
        data: postData
      });
      return response;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  updatePost: async (postId, postData) => {
    try {
      const response = await apiManager.request(`/community/posts/${postId}`, {
        method: 'PUT',
        data: postData
      });
      return response;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await apiManager.request(`/community/posts/${postId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Post interactions
  interactWithPost: async (postId, action, data = {}) => {
    try {
      switch (action) {
        case 'like':
          return await apiManager.request(`/community/posts/${postId}/like`, {
            method: 'POST'
          });
        case 'unlike':
          return await apiManager.request(`/community/posts/${postId}/like`, {
            method: 'DELETE'
          });
        case 'comment':
          return await apiManager.request(`/community/posts/${postId}/comments`, {
            method: 'POST',
            data
          });
        default:
          throw new Error('Unknown action');
      }
    } catch (error) {
      console.error('Error interacting with post:', error);
      throw error;
    }
  },

  // Study Groups
  getStudyGroups: async (params = {}) => {
    try {
      const response = await apiManager.request('/community/study-groups', { params });
      return response;
    } catch (error) {
      console.error('Error getting study groups:', error);
      return { data: mockStudyGroups };
    }
  },

  getStudyGroup: async (groupId) => {
    try {
      const response = await apiManager.request(`/community/study-groups/${groupId}`);
      return response;
    } catch (error) {
      console.error('Error getting study group:', error);
      // Fallback to mock data
      const group = mockStudyGroups.find(g => g.id === parseInt(groupId));
      if (group) {
        return { data: group };
      }
      throw error;
    }
  },

  createStudyGroup: async (groupData) => {
    try {
      const response = await apiManager.request('/community/study-groups', {
        method: 'POST',
        data: groupData
      });
      return response;
    } catch (error) {
      console.error('Error creating study group:', error);
      throw error;
    }
  },

  joinStudyGroup: async (groupId) => {
    try {
      const response = await apiManager.request(`/community/study-groups/${groupId}/join`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Error joining study group:', error);
      throw error;
    }
  },

  leaveStudyGroup: async (groupId) => {
    try {
      const response = await apiManager.request(`/community/study-groups/${groupId}/leave`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error leaving study group:', error);
      throw error;
    }
  }
};

export default communityService;
