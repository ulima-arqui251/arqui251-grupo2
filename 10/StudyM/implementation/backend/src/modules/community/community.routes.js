import express from 'express';
import communityController from './community.controller.js';
import communityValidation from './community.validation.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';

const router = express.Router();

// Middleware para verificar autenticación en todas las rutas
router.use(authenticate);

// ===== RUTAS DE POSTS =====

/**
 * @route GET /api/community/posts
 * @desc Obtener posts con filtros y paginación
 * @access Private
 */
router.get('/posts', 
  validate(communityValidation.getPosts),
  communityController.getPosts
);

/**
 * @route POST /api/community/posts
 * @desc Crear un nuevo post
 * @access Private
 */
router.post('/posts', 
  validate(communityValidation.createPost),
  communityController.createPost
);

/**
 * @route GET /api/community/posts/:id
 * @desc Obtener un post específico
 * @access Private
 */
router.get('/posts/:id', 
  validate(communityValidation.idParam),
  communityController.getPostById
);

/**
 * @route PUT /api/community/posts/:id
 * @desc Actualizar un post
 * @access Private
 */
router.put('/posts/:id', 
  validate(communityValidation.idParam),
  validate(communityValidation.updatePost),
  communityController.updatePost
);

/**
 * @route DELETE /api/community/posts/:id
 * @desc Eliminar un post
 * @access Private
 */
router.delete('/posts/:id', 
  validate(communityValidation.idParam),
  communityController.deletePost
);

/**
 * @route POST /api/community/posts/:id/like
 * @desc Dar like/dislike a un post
 * @access Private
 */
router.post('/posts/:id/like', 
  validate(communityValidation.idParam),
  validate(communityValidation.togglePostLike),
  communityController.togglePostLike
);

/**
 * @route POST /api/community/posts/:id/pin
 * @desc Fijar/desfijar un post (admin/teacher)
 * @access Private (Admin/Teacher)
 */
router.post('/posts/:id/pin', 
  validate(communityValidation.idParam),
  communityController.togglePinPost
);

/**
 * @route POST /api/community/posts/:id/archive
 * @desc Archivar un post (admin/teacher)
 * @access Private (Admin/Teacher)
 */
router.post('/posts/:id/archive', 
  validate(communityValidation.idParam),
  communityController.archivePost
);

/**
 * @route GET /api/community/users/:userId/posts
 * @desc Obtener posts de un usuario específico
 * @access Private
 */
router.get('/users/:userId/posts', 
  validate(communityValidation.userIdParam),
  communityController.getUserPosts
);

// ===== RUTAS DE COMENTARIOS =====

/**
 * @route POST /api/community/comments
 * @desc Crear un comentario
 * @access Private
 */
router.post('/comments', 
  validate(communityValidation.createComment),
  communityController.createComment
);

/**
 * @route POST /api/community/comments/:id/like
 * @desc Dar like/dislike a un comentario
 * @access Private
 */
router.post('/comments/:id/like', 
  validate(communityValidation.idParam),
  validate(communityValidation.toggleCommentLike),
  communityController.toggleCommentLike
);

/**
 * @route POST /api/community/comments/:id/best-answer
 * @desc Marcar comentario como mejor respuesta
 * @access Private
 */
router.post('/comments/:id/best-answer', 
  validate(communityValidation.idParam),
  communityController.markBestAnswer
);

// ===== RUTAS DE GRUPOS DE ESTUDIO =====

/**
 * @route GET /api/community/study-groups
 * @desc Obtener grupos de estudio
 * @access Private
 */
router.get('/study-groups', 
  validate(communityValidation.getStudyGroups),
  communityController.getStudyGroups
);

/**
 * @route POST /api/community/study-groups
 * @desc Crear un grupo de estudio
 * @access Private
 */
router.post('/study-groups', 
  validate(communityValidation.createStudyGroup),
  communityController.createStudyGroup
);

/**
 * @route GET /api/community/study-groups/my-groups
 * @desc Obtener mis grupos (donde soy miembro)
 * @access Private
 */
router.get('/study-groups/my-groups', 
  communityController.getMyGroups
);

/**
 * @route GET /api/community/study-groups/:id
 * @desc Obtener un grupo específico
 * @access Private
 */
router.get('/study-groups/:id', 
  validate(communityValidation.idParam),
  communityController.getStudyGroupById
);

/**
 * @route POST /api/community/study-groups/:id/join
 * @desc Unirse a un grupo de estudio
 * @access Private
 */
router.post('/study-groups/:id/join', 
  validate(communityValidation.idParam),
  communityController.joinStudyGroup
);

/**
 * @route POST /api/community/study-groups/:id/leave
 * @desc Salir de un grupo de estudio
 * @access Private
 */
router.post('/study-groups/:id/leave', 
  validate(communityValidation.idParam),
  communityController.leaveStudyGroup
);

// ===== RUTAS DE ESTADÍSTICAS =====

/**
 * @route GET /api/community/stats
 * @desc Obtener estadísticas de la comunidad
 * @access Private
 */
router.get('/stats', 
  communityController.getCommunityStats
);

export default router;
