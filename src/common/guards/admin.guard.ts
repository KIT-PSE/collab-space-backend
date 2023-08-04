import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';

/**
 * Guard that checks if the user has the 'admin' role.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  /**
   * Constructor that injects the AuthService.
   * @param auth - The AuthService instance.
   */
  constructor(private auth: AuthService) {}

  /**
   * Determine whether the user has the 'admin' role and is authorized.
   * @param context - The execution context.
   * @returns A boolean indicating whether the user is authorized as an admin.
   * @throws UnauthorizedException if the user is not authorized.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = await this.auth.user();

    if (!user) {
      throw new UnauthorizedException('Not authorized');
    }

    return user.role === 'admin';
  }
}
