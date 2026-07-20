import { Router } from 'express';
import { authController } from './auth.container';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/authenticate.middleware';
import { registerSchema, loginSchema } from '../dto/auth.dto';

const router = Router();

router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
