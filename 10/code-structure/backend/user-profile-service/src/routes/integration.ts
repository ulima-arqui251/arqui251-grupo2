import { Router } from 'express';
import IntegrationController from '../controllers/IntegrationController';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

// Service-to-service authentication middleware (simple API key for now)
const serviceAuth = (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.SERVICE_API_KEY || 'studymate-services-secret-key';
  
  if (apiKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key for service-to-service communication'
    });
  }
  
  next();
};

// Health check (public)
router.get('/health', IntegrationController.healthCheck);

// Create profile from auth service
router.post(
  '/profiles',
  serviceAuth,
  validate([
    body('userId').isUUID().withMessage('User ID must be a valid UUID'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required')
  ]),
  IntegrationController.createProfileFromAuth
);

// Update user email
router.put(
  '/profiles/:userId/email',
  serviceAuth,
  validate([
    param('userId').isUUID().withMessage('User ID must be a valid UUID'),
    body('email').isEmail().withMessage('Valid email is required')
  ]),
  IntegrationController.updateUserEmail
);

// Delete profile from auth service
router.delete(
  '/profiles/:userId',
  serviceAuth,
  validate([
    param('userId').isUUID().withMessage('User ID must be a valid UUID')
  ]),
  IntegrationController.deleteProfileFromAuth
);

// Get profile summary
router.get(
  '/profiles/:userId/summary',
  serviceAuth,
  validate([
    param('userId').isUUID().withMessage('User ID must be a valid UUID')
  ]),
  IntegrationController.getProfileSummary
);

export default router;
