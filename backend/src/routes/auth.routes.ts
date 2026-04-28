import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/v1/auth/login
 * @desc Login de usuário
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route GET /api/v1/auth/me
 * @desc Obter dados do usuário autenticado
 * @access Private
 */
router.get('/me', authenticate, authController.me);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout de usuário
 * @access Private
 */
router.post('/logout', authenticate, authController.logout);

export default router;
