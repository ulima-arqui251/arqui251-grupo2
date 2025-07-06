import { Router } from 'express';
import UserProfileController from '../controllers/UserProfileController';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { uploadAvatar, handleUploadError } from '../middleware/upload';
import { validate } from '../middleware/validation';
import {
  createProfileValidation,
  updateProfileValidation,
  updatePreferencesValidation,
  updatePrivacyValidation,
  profileIdValidation,
  searchValidation,
  paginationValidation
} from '../validators/profile';

const router = Router();

// Create profile
router.post(
  '/',
  authenticateToken,
  validate(createProfileValidation),
  UserProfileController.createProfile
);

// Get own profile
router.get(
  '/me',
  authenticateToken,
  UserProfileController.getProfile
);

// Update profile
router.put(
  '/me',
  authenticateToken,
  validate(updateProfileValidation),
  UserProfileController.updateProfile
);

// Update preferences
router.put(
  '/me/preferences',
  authenticateToken,
  validate(updatePreferencesValidation),
  UserProfileController.updatePreferences
);

// Update privacy settings
router.put(
  '/me/privacy',
  authenticateToken,
  validate(updatePrivacyValidation),
  UserProfileController.updatePrivacy
);

// Upload avatar
router.post(
  '/me/avatar',
  authenticateToken,
  uploadAvatar,
  handleUploadError,
  UserProfileController.uploadAvatar
);

// Delete profile
router.delete(
  '/me',
  authenticateToken,
  UserProfileController.deleteProfile
);

// Get user activity
router.get(
  '/me/activity',
  authenticateToken,
  validate(paginationValidation),
  UserProfileController.getUserActivity
);

// Search profiles
router.get(
  '/search',
  optionalAuth,
  validate(searchValidation),
  UserProfileController.searchProfiles
);

// Get public profiles
router.get(
  '/public',
  optionalAuth,
  validate(paginationValidation),
  UserProfileController.getPublicProfiles
);

// Get profile by ID
router.get(
  '/:id',
  optionalAuth,
  validate(profileIdValidation),
  UserProfileController.getProfileById
);

export default router;
