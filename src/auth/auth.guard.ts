import { Injectable } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

/**
 * Custom authentication guard extending PassportAuthGuard for JWT-based authentication.
 */
@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(
    private readonly auth: AuthService,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  /**
   * Determines if the request is authorized.
   * Extends the default canActivate method of PassportAuthGuard.
   *
   * @param context - ExecutionContext containing the request and response objects.
   * @returns A boolean indicating if the request is authorized.
   */
  async canActivate(context) {
    const canActivateResult = (await super.canActivate(context)) as boolean;

    if (canActivateResult) {
      const response = context.switchToHttp().getResponse();
      const user = await this.auth.user();

      const payload = { sub: user.id };
      const token = this.jwtService.sign(payload);

      response.cookie('jwt', token, { httpOnly: true });
    }

    return canActivateResult;
  }
}
