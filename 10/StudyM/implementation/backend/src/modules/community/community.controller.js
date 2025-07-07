import communityService from './community.service.js';
import { successResponse, errorResponse, paginatedResponse, notFoundResponse, forbiddenResponse } from '../../utils/responses.js';

class CommunityController {
  // ===== POSTS =====

  /**
   * Crear un nuevo post
   */
  async createPost(req, res) {
    try {
      const userId = req.user.id;
      const postData = req.body;

      const post = await communityService.createPost(userId, postData);
      
      return successResponse(res, post, 'Post creado exitosamente', 201);
    } catch (error) {
      console.error('Error creando post:', error);
      return errorResponse(res, error.message || 'Error al crear el post', 500);
    }
  }

  /**
   * Obtener posts con filtros y paginación
   */
  async getPosts(req, res) {
    try {
      const filters = {
        type: req.query.type,
        subject: req.query.subject,
        search: req.query.search,
        userId: req.query.userId,
        isPinned: req.query.isPinned ? req.query.isPinned === 'true' : undefined,
        isResolved: req.query.isResolved ? req.query.isResolved === 'true' : undefined
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'DESC'
      };

      const result = await communityService.getPosts(filters, pagination);
      
      return paginatedResponse(res, result.posts, {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalPosts,
        itemsPerPage: pagination.limit,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      });
    } catch (error) {
      console.error('Error obteniendo posts:', error);
      return errorResponse(res, 'Error al obtener los posts', 500);
    }
  }

  /**
   * Obtener un post específico
   */
  async getPostById(req, res) {
    try {
      const { id } = req.params;
      
      const post = await communityService.getPostById(id);
      
      return successResponse(res, post, 'Post obtenido exitosamente');
    } catch (error) {
      console.error('Error obteniendo post:', error);
      if (error.message === 'Post no encontrado') {
        return notFoundResponse(res, 'Post');
      }
      return errorResponse(res, 'Error al obtener el post', 500);
    }
  }

  /**
   * Actualizar un post
   */
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const post = await communityService.updatePost(id, userId, updateData);
      
      return successResponse(res, post, 'Post actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando post:', error);
      if (error.message === 'Post no encontrado') {
        return notFoundResponse(res, 'Post');
      }
      if (error.message.includes('permisos')) {
        return forbiddenResponse(res, error.message);
      }
      return errorResponse(res, 'Error al actualizar el post', 500);
    }
  }

  /**
   * Eliminar un post
   */
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await communityService.deletePost(id, userId);
      
      return successResponse(res, null, result.message);
    } catch (error) {
      console.error('Error eliminando post:', error);
      if (error.message === 'Post no encontrado') {
        return notFoundResponse(res, 'Post');
      }
      if (error.message.includes('permisos')) {
        return forbiddenResponse(res, error.message);
      }
      return errorResponse(res, 'Error al eliminar el post', 500);
    }
  }

  /**
   * Dar like/dislike a un post
   */
  async togglePostLike(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { type = 'like' } = req.body;

      const result = await communityService.togglePostLike(id, userId, type);
      
      return successResponse(res, result, `${type} aplicado exitosamente`);
    } catch (error) {
      console.error('Error en like de post:', error);
      if (error.message === 'Post no encontrado') {
        return notFoundResponse(res, 'Post');
      }
      return errorResponse(res, 'Error al procesar el like', 500);
    }
  }

  // ===== COMMENTS =====

  /**
   * Crear un comentario
   */
  async createComment(req, res) {
    try {
      const userId = req.user.id;
      const commentData = req.body;

      const comment = await communityService.createComment(userId, commentData);
      
      return successResponse(res, comment, 'Comentario creado exitosamente', 201);
    } catch (error) {
      console.error('Error creando comentario:', error);
      if (error.message === 'Post no encontrado') {
        return notFoundResponse(res, 'Post');
      }
      return errorResponse(res, error.message || 'Error al crear el comentario', 500);
    }
  }

  /**
   * Marcar comentario como mejor respuesta
   */
  async markBestAnswer(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const comment = await communityService.markBestAnswer(id, userId);
      
      return successResponse(res, comment, 'Comentario marcado como mejor respuesta');
    } catch (error) {
      console.error('Error marcando mejor respuesta:', error);
      if (error.message === 'Comentario no encontrado') {
        return notFoundResponse(res, 'Comentario');
      }
      if (error.message.includes('permisos')) {
        return forbiddenResponse(res, error.message);
      }
      return errorResponse(res, 'Error al marcar como mejor respuesta', 500);
    }
  }

  /**
   * Dar like/dislike a un comentario
   */
  async toggleCommentLike(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { type = 'like' } = req.body;

      const result = await communityService.toggleCommentLike(id, userId, type);
      
      return successResponse(res, result, `${type} aplicado exitosamente`);
    } catch (error) {
      console.error('Error en like de comentario:', error);
      if (error.message === 'Comentario no encontrado') {
        return notFoundResponse(res, 'Comentario');
      }
      return errorResponse(res, 'Error al procesar el like', 500);
    }
  }

  // ===== STUDY GROUPS =====

  /**
   * Crear grupo de estudio
   */
  async createStudyGroup(req, res) {
    try {
      const userId = req.user.id;
      const groupData = req.body;

      const group = await communityService.createStudyGroup(userId, groupData);
      
      return successResponse(res, group, 'Grupo de estudio creado exitosamente', 201);
    } catch (error) {
      console.error('Error creando grupo:', error);
      return errorResponse(res, error.message || 'Error al crear el grupo', 500);
    }
  }

  /**
   * Obtener grupos de estudio
   */
  async getStudyGroups(req, res) {
    try {
      const filters = {
        subject: req.query.subject,
        level: req.query.level,
        search: req.query.search,
        isPrivate: req.query.isPrivate ? req.query.isPrivate === 'true' : undefined
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await communityService.getStudyGroups(filters, pagination);
      
      return paginatedResponse(res, result.groups, {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalGroups,
        itemsPerPage: pagination.limit,
        hasNext: result.currentPage < result.totalPages,
        hasPrev: result.currentPage > 1
      });
    } catch (error) {
      console.error('Error obteniendo grupos:', error);
      return errorResponse(res, 'Error al obtener los grupos', 500);
    }
  }

  /**
   * Obtener grupo específico
   */
  async getStudyGroupById(req, res) {
    try {
      const { id } = req.params;
      
      const group = await communityService.getStudyGroupById(id);
      
      return successResponse(res, group, 'Grupo obtenido exitosamente');
    } catch (error) {
      console.error('Error obteniendo grupo:', error);
      if (error.message === 'Grupo no encontrado') {
        return notFoundResponse(res, 'Grupo');
      }
      return errorResponse(res, 'Error al obtener el grupo', 500);
    }
  }

  /**
   * Unirse a un grupo
   */
  async joinStudyGroup(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const group = await communityService.joinStudyGroup(id, userId);
      
      return successResponse(res, group, 'Te has unido al grupo exitosamente');
    } catch (error) {
      console.error('Error uniéndose al grupo:', error);
      if (error.message === 'Grupo no encontrado') {
        return notFoundResponse(res, 'Grupo');
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Salir de un grupo
   */
  async leaveStudyGroup(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await communityService.leaveStudyGroup(id, userId);
      
      return successResponse(res, null, result.message);
    } catch (error) {
      console.error('Error saliendo del grupo:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Obtener mis grupos (donde soy miembro)
   */
  async getMyGroups(req, res) {
    try {
      const userId = req.user.id;
      
      const filters = { userId: userId };
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await communityService.getStudyGroups(filters, pagination);
      
      return paginatedResponse(res, result.groups, {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalGroups,
        itemsPerPage: pagination.limit,
        hasNext: result.currentPage < result.totalPages,
        hasPrev: result.currentPage > 1
      });
    } catch (error) {
      console.error('Error obteniendo mis grupos:', error);
      return errorResponse(res, 'Error al obtener tus grupos', 500);
    }
  }

  /**
   * Obtener estadísticas de la comunidad
   */
  async getCommunityStats(req, res) {
    try {
      const stats = await communityService.getCommunityStats();
      
      return successResponse(res, stats, 'Estadísticas de comunidad obtenidas');
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return errorResponse(res, 'Error al obtener las estadísticas', 500);
    }
  }

  // ===== ADMIN FUNCTIONS =====

  /**
   * Fijar/desfijar un post (admin/teacher)
   */
  async togglePinPost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const user = req.user;

      // Verificar permisos
      if (user.role !== 'admin' && user.role !== 'teacher') {
        return forbiddenResponse(res, 'No tienes permisos para fijar posts');
      }

      const post = await communityService.updatePost(id, userId, {
        isPinned: !req.body.isPinned
      });
      
      return successResponse(res, post, 'Estado del pin actualizado');
    } catch (error) {
      console.error('Error cambiando pin de post:', error);
      return errorResponse(res, 'Error al cambiar el estado del pin', 500);
    }
  }

  /**
   * Archivar un post (admin/teacher)
   */
  async archivePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const user = req.user;

      // Verificar permisos
      if (user.role !== 'admin' && user.role !== 'teacher') {
        return forbiddenResponse(res, 'No tienes permisos para archivar posts');
      }

      const post = await communityService.updatePost(id, userId, {
        isArchived: true
      });
      
      return successResponse(res, post, 'Post archivado exitosamente');
    } catch (error) {
      console.error('Error archivando post:', error);
      return errorResponse(res, 'Error al archivar el post', 500);
    }
  }

  /**
   * Obtener posts de un usuario específico
   */
  async getUserPosts(req, res) {
    try {
      const { userId } = req.params;
      
      const filters = { userId: userId };
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await communityService.getPosts(filters, pagination);
      
      return paginatedResponse(res, result.posts, {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalPosts,
        itemsPerPage: pagination.limit,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      });
    } catch (error) {
      console.error('Error obteniendo posts de usuario:', error);
      return errorResponse(res, 'Error al obtener los posts del usuario', 500);
    }
  }
}

export default new CommunityController();
