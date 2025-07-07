import { Op } from 'sequelize';
import { sequelize } from '../../config/database.js';
import { User, Post, Comment, PostLike, CommentLike, StudyGroup, StudyGroupMember } from '../../models/index.js';
import { GamificationService } from '../gamification/gamification.service.js';

const gamificationService = new GamificationService();

class CommunityService {
  // ===== POSTS =====
  
  /**
   * Crear un nuevo post
   */
  async createPost(userId, postData) {
    const { title, content, type, subject, tags } = postData;
    
    const post = await Post.create({
      title,
      content,
      type,
      subject,
      tags: tags || [],
      userId
    });

    // Otorgar puntos por crear un post
    await gamificationService.awardPoints(userId, 10, 'post_created', `Post creado: ${title}`);

    return await this.getPostById(post.id);
  }

  /**
   * Obtener posts con filtros
   */
  async getPosts(filters = {}, pagination = {}) {
    const { 
      type, 
      subject, 
      search, 
      userId, 
      isPinned,
      isResolved 
    } = filters;
    
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = pagination;

    const offset = (page - 1) * limit;
    
    const whereClause = {
      isArchived: false
    };

    if (type) whereClause.type = type;
    if (subject) whereClause.subject = subject;
    if (userId) whereClause.userId = userId;
    if (isPinned !== undefined) whereClause.isPinned = isPinned;
    if (isResolved !== undefined) whereClause.isResolved = isResolved;
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Post.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email', 'role']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username']
            }
          ],
          limit: 3, // Solo mostrar los primeros 3 comentarios
          order: [['createdAt', 'ASC']]
        }
      ],
      order: [
        ['isPinned', 'DESC'], // Posts fijados primero
        [sortBy, sortOrder]
      ],
      limit,
      offset,
      distinct: true
    });

    return {
      posts: rows,
      totalPosts: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      hasNext: page < Math.ceil(count / limit),
      hasPrev: page > 1
    };
  }

  /**
   * Obtener un post por ID
   */
  async getPostById(postId) {
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email', 'role']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username']
            },
            {
              model: Comment,
              as: 'replies',
              include: [
                {
                  model: User,
                  as: 'author',
                  attributes: ['id', 'username']
                }
              ]
            }
          ],
          where: { parentCommentId: null }, // Solo comentarios principales
          order: [
            ['isBestAnswer', 'DESC'],
            ['likeCount', 'DESC'],
            ['createdAt', 'ASC']
          ]
        }
      ]
    });

    if (!post) {
      throw new Error('Post no encontrado');
    }

    // Incrementar contador de vistas
    await post.increment('viewCount');

    return post;
  }

  /**
   * Actualizar un post
   */
  async updatePost(postId, userId, updateData) {
    const post = await Post.findByPk(postId);
    
    if (!post) {
      throw new Error('Post no encontrado');
    }

    // Verificar que el usuario sea el autor o tenga permisos
    const user = await User.findByPk(userId);
    if (post.userId !== userId && user.role !== 'admin' && user.role !== 'teacher') {
      throw new Error('No tienes permisos para editar este post');
    }

    await post.update(updateData);
    return await this.getPostById(postId);
  }

  /**
   * Eliminar un post
   */
  async deletePost(postId, userId) {
    const post = await Post.findByPk(postId);
    
    if (!post) {
      throw new Error('Post no encontrado');
    }

    // Verificar permisos
    const user = await User.findByPk(userId);
    if (post.userId !== userId && user.role !== 'admin' && user.role !== 'teacher') {
      throw new Error('No tienes permisos para eliminar este post');
    }

    await post.destroy(); // Soft delete
    return { message: 'Post eliminado correctamente' };
  }

  /**
   * Dar like/dislike a un post
   */
  async togglePostLike(postId, userId, type = 'like') {
    const post = await Post.findByPk(postId);
    if (!post) {
      throw new Error('Post no encontrado');
    }

    // Verificar si ya existe un like/dislike
    const existingLike = await PostLike.findOne({
      where: { postId, userId }
    });

    let action = '';
    let pointsChange = 0;

    if (existingLike) {
      if (existingLike.type === type) {
        // Remover like/dislike
        await existingLike.destroy();
        action = 'removed';
        pointsChange = type === 'like' ? -1 : 1;
      } else {
        // Cambiar tipo de like/dislike
        await existingLike.update({ type });
        action = 'changed';
        pointsChange = type === 'like' ? 2 : -2;
      }
    } else {
      // Crear nuevo like/dislike
      await PostLike.create({ postId, userId, type });
      action = 'added';
      pointsChange = type === 'like' ? 1 : -1;
    }

    // Actualizar contador en el post
    await post.increment('likeCount', { by: pointsChange });

    // Otorgar puntos al autor del post si recibe likes
    if (type === 'like' && action === 'added') {
      await gamificationService.awardPoints(post.userId, 2, 'post_liked', 'Post recibió un like');
    }

    return {
      action,
      type,
      newLikeCount: post.likeCount + pointsChange
    };
  }

  // ===== COMMENTS =====

  /**
   * Crear un comentario
   */
  async createComment(userId, commentData) {
    const { postId, content, parentCommentId } = commentData;

    const post = await Post.findByPk(postId);
    if (!post) {
      throw new Error('Post no encontrado');
    }

    const comment = await Comment.create({
      content,
      postId,
      userId,
      parentCommentId
    });

    // Otorgar puntos por comentar
    await gamificationService.awardPoints(userId, 5, 'comment_created', 'Comentario creado');

    // Si es una respuesta a una pregunta, marcar como respuesta
    if (post.type === 'question' && !parentCommentId) {
      await comment.update({ isAnswer: true });
    }

    return await this.getCommentById(comment.id);
  }

  /**
   * Obtener comentario por ID
   */
  async getCommentById(commentId) {
    const comment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username']
            }
          ]
        }
      ]
    });

    if (!comment) {
      throw new Error('Comentario no encontrado');
    }

    return comment;
  }

  /**
   * Marcar comentario como mejor respuesta
   */
  async markBestAnswer(commentId, userId) {
    const comment = await Comment.findByPk(commentId, {
      include: [{ model: Post, as: 'post' }]
    });

    if (!comment) {
      throw new Error('Comentario no encontrado');
    }

    const post = comment.post;
    
    // Verificar que sea el autor del post o admin/teacher
    const user = await User.findByPk(userId);
    if (post.userId !== userId && user.role !== 'admin' && user.role !== 'teacher') {
      throw new Error('No tienes permisos para marcar la mejor respuesta');
    }

    // Desmarcar otras respuestas como mejores
    await Comment.update(
      { isBestAnswer: false },
      { where: { postId: post.id } }
    );

    // Marcar esta como mejor respuesta
    await comment.update({ isBestAnswer: true });
    
    // Marcar post como resuelto
    await post.update({ isResolved: true });

    // Otorgar puntos por mejor respuesta
    await gamificationService.awardPoints(comment.userId, 15, 'best_answer', 'Respuesta marcada como la mejor');

    return await this.getCommentById(commentId);
  }

  /**
   * Toggle like en comentario
   */
  async toggleCommentLike(commentId, userId, type = 'like') {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      throw new Error('Comentario no encontrado');
    }

    const existingLike = await CommentLike.findOne({
      where: { commentId, userId }
    });

    let action = '';
    let pointsChange = 0;

    if (existingLike) {
      if (existingLike.type === type) {
        await existingLike.destroy();
        action = 'removed';
        pointsChange = type === 'like' ? -1 : 1;
      } else {
        await existingLike.update({ type });
        action = 'changed';
        pointsChange = type === 'like' ? 2 : -2;
      }
    } else {
      await CommentLike.create({ commentId, userId, type });
      action = 'added';
      pointsChange = type === 'like' ? 1 : -1;
    }

    await comment.increment('likeCount', { by: pointsChange });

    if (type === 'like' && action === 'added') {
      await gamificationService.awardPoints(comment.userId, 1, 'comment_liked', 'Comentario recibió un like');
    }

    return {
      action,
      type,
      newLikeCount: comment.likeCount + pointsChange
    };
  }

  // ===== STUDY GROUPS =====

  /**
   * Crear grupo de estudio
   */
  async createStudyGroup(userId, groupData) {
    const { name, description, subject, level, isPrivate, maxMembers } = groupData;

    const group = await StudyGroup.create({
      name,
      description,
      subject,
      level,
      isPrivate,
      maxMembers,
      ownerId: userId
    });

    // Agregar al creador como miembro owner
    await StudyGroupMember.create({
      userId,
      studyGroupId: group.id,
      role: 'owner'
    });

    // Otorgar puntos por crear grupo
    await gamificationService.awardPoints(userId, 20, 'group_created', `Grupo creado: ${name}`);

    return await this.getStudyGroupById(group.id);
  }

  /**
   * Obtener grupos de estudio
   */
  async getStudyGroups(filters = {}, pagination = {}) {
    const { subject, level, search, isPrivate } = filters;
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const whereClause = {
      isActive: true
    };

    if (subject) whereClause.subject = subject;
    if (level) whereClause.level = level;
    if (isPrivate !== undefined) whereClause.isPrivate = isPrivate;
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await StudyGroup.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username']
        },
        {
          model: StudyGroupMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      groups: rows,
      totalGroups: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  }

  /**
   * Obtener grupo por ID
   */
  async getStudyGroupById(groupId) {
    const group = await StudyGroup.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        },
        {
          model: StudyGroupMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email']
            }
          ]
        }
      ]
    });

    if (!group) {
      throw new Error('Grupo no encontrado');
    }

    return group;
  }

  /**
   * Unirse a un grupo
   */
  async joinStudyGroup(groupId, userId) {
    const group = await StudyGroup.findByPk(groupId);
    if (!group) {
      throw new Error('Grupo no encontrado');
    }

    if (!group.isActive) {
      throw new Error('El grupo no está activo');
    }

    if (group.memberCount >= group.maxMembers) {
      throw new Error('El grupo ha alcanzado el máximo de miembros');
    }

    // Verificar si ya es miembro
    const existingMember = await StudyGroupMember.findOne({
      where: { userId, studyGroupId: groupId }
    });

    if (existingMember) {
      throw new Error('Ya eres miembro de este grupo');
    }

    await StudyGroupMember.create({
      userId,
      studyGroupId: groupId,
      role: 'member'
    });

    await group.increment('memberCount');

    // Otorgar puntos por unirse al grupo
    await gamificationService.awardPoints(userId, 5, 'group_joined', `Se unió al grupo: ${group.name}`);

    return await this.getStudyGroupById(groupId);
  }

  /**
   * Salir de un grupo
   */
  async leaveStudyGroup(groupId, userId) {
    const membership = await StudyGroupMember.findOne({
      where: { userId, studyGroupId: groupId }
    });

    if (!membership) {
      throw new Error('No eres miembro de este grupo');
    }

    if (membership.role === 'owner') {
      throw new Error('El propietario no puede salir del grupo. Transfiere la propiedad primero.');
    }

    await membership.destroy();
    
    const group = await StudyGroup.findByPk(groupId);
    await group.decrement('memberCount');

    return { message: 'Has salido del grupo exitosamente' };
  }

  /**
   * Obtener estadísticas de la comunidad
   */
  async getCommunityStats() {
    const [
      totalPosts,
      totalComments,
      totalStudyGroups,
      totalActiveUsers,
      postsByType,
      postsBySubject
    ] = await Promise.all([
      Post.count({ where: { isArchived: false } }),
      Comment.count(),
      StudyGroup.count({ where: { isActive: true } }),
      User.count({ where: { isActive: true } }),
      Post.findAll({
        attributes: ['type', [sequelize.fn('COUNT', sequelize.col('type')), 'count']],
        where: { isArchived: false },
        group: ['type'],
        raw: true
      }),
      Post.findAll({
        attributes: ['subject', [sequelize.fn('COUNT', sequelize.col('subject')), 'count']],
        where: { isArchived: false, subject: { [Op.not]: null } },
        group: ['subject'],
        raw: true
      })
    ]);

    return {
      totalPosts,
      totalComments,
      totalStudyGroups,
      totalActiveUsers,
      postsByType,
      postsBySubject
    };
  }
}

export default new CommunityService();
