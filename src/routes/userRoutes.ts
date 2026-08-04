import { Router } from 'express';

import { meHandler } from '../controllers/userHttpController';
import { authenticateJWT } from '../middleware/auth';

export const userRoutes = Router();

userRoutes.get('/me', authenticateJWT, meHandler);
