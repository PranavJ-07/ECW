import { passwordService } from '../../../application/auth/services/password.service';
import { authTokenService } from '../../../application/auth/services/auth-token.service';
import { permissionService } from '../../../application/auth/services/permission.service';
import { RegisterUserUseCase } from '../../../application/auth/use-cases/register-user.usecase';
import { LoginUserUseCase } from '../../../application/auth/use-cases/login-user.usecase';
import { GetCurrentUserUseCase } from '../../../application/auth/use-cases/get-current-user.usecase';
import { userRepository } from '../../../infrastructure/database/repositories/user.repository';
import { collegeRepository } from '../../../infrastructure/database/repositories/college.repository';
import { AuthController } from '../controllers/auth.controller';

/**
 * Composition root for auth module dependencies.
 * Wires interfaces to concrete implementations in one place.
 */
const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  collegeRepository,
  passwordService,
);

const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  collegeRepository,
  passwordService,
  authTokenService,
);

const getCurrentUserUseCase = new GetCurrentUserUseCase(
  userRepository,
  collegeRepository,
  permissionService,
);

export const authController = new AuthController(
  registerUserUseCase,
  loginUserUseCase,
  getCurrentUserUseCase,
);
