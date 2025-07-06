import { body, param, query } from 'express-validator';

export const createProfileValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
    
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters'),
    
  body('occupation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occupation must not exceed 100 characters'),
    
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Website must be a valid URL'),
    
  body('socialLinks.twitter')
    .optional()
    .trim()
    .isURL()
    .withMessage('Twitter link must be a valid URL'),
    
  body('socialLinks.linkedin')
    .optional()
    .trim()
    .isURL()
    .withMessage('LinkedIn link must be a valid URL'),
    
  body('socialLinks.github')
    .optional()
    .trim()
    .isURL()
    .withMessage('GitHub link must be a valid URL')
];

export const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
    
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters'),
    
  body('occupation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occupation must not exceed 100 characters'),
    
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Website must be a valid URL'),
    
  body('socialLinks.twitter')
    .optional()
    .trim()
    .isURL()
    .withMessage('Twitter link must be a valid URL'),
    
  body('socialLinks.linkedin')
    .optional()
    .trim()
    .isURL()
    .withMessage('LinkedIn link must be a valid URL'),
    
  body('socialLinks.github')
    .optional()
    .trim()
    .isURL()
    .withMessage('GitHub link must be a valid URL')
];

export const updatePreferencesValidation = [
  body('language')
    .optional()
    .isIn(['es', 'en', 'fr', 'de', 'it', 'pt'])
    .withMessage('Language must be one of: es, en, fr, de, it, pt'),
    
  body('timezone')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Timezone is required'),
    
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Theme must be one of: light, dark, system'),
    
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
    
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be a boolean'),
    
  body('notifications.studyReminders')
    .optional()
    .isBoolean()
    .withMessage('Study reminders must be a boolean'),
    
  body('notifications.progressUpdates')
    .optional()
    .isBoolean()
    .withMessage('Progress updates must be a boolean'),
    
  body('notifications.socialActivity')
    .optional()
    .isBoolean()
    .withMessage('Social activity notifications must be a boolean'),
    
  body('studySettings.defaultStudyTime')
    .optional()
    .isInt({ min: 5, max: 240 })
    .withMessage('Default study time must be between 5 and 240 minutes'),
    
  body('studySettings.breakTime')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Break time must be between 1 and 60 minutes'),
    
  body('studySettings.dailyGoal')
    .optional()
    .isInt({ min: 15, max: 720 })
    .withMessage('Daily goal must be between 15 and 720 minutes'),
    
  body('studySettings.weeklyGoal')
    .optional()
    .isInt({ min: 60, max: 5040 })
    .withMessage('Weekly goal must be between 60 and 5040 minutes'),
    
  body('studySettings.difficultyLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty level must be one of: beginner, intermediate, advanced'),
    
  body('studySettings.preferredCategories')
    .optional()
    .isArray()
    .withMessage('Preferred categories must be an array')
];

export const updatePrivacyValidation = [
  body('profileVisibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Profile visibility must be one of: public, friends, private'),
    
  body('showProgress')
    .optional()
    .isBoolean()
    .withMessage('Show progress must be a boolean'),
    
  body('showAchievements')
    .optional()
    .isBoolean()
    .withMessage('Show achievements must be a boolean'),
    
  body('showActivity')
    .optional()
    .isBoolean()
    .withMessage('Show activity must be a boolean'),
    
  body('allowMessages')
    .optional()
    .isBoolean()
    .withMessage('Allow messages must be a boolean')
];

export const profileIdValidation = [
  param('id')
    .isUUID(4)
    .withMessage('Profile ID must be a valid UUID')
];

export const searchValidation = [
  query('q')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

export const paginationValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];
