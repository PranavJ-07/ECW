import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '../../../application/auth/use-cases/register-user.usecase';
import { LoginUserUseCase } from '../../../application/auth/use-cases/login-user.usecase';
import { GetCurrentUserUseCase } from '../../../application/auth/use-cases/get-current-user.usecase';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

/**
 * Thin HTTP adapter — parses requests, calls use cases, formats responses.
 * No business logic lives here.
 */
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as RegisterDto;
      const result = await this.registerUserUseCase.execute(body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as LoginDto;
      const result = await this.loginUserUseCase.execute(body);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getCurrentUserUseCase.execute(req.authUser!.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
