import { Injectable } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(
    private readonly auth: AuthService,
    private readonly jwtService: JwtService,
  ) {
    super();
  }
  async canActivate(context) {
    const _canActivate = (await super.canActivate(context)) as boolean;

    if (_canActivate) {
      const response = context.switchToHttp().getResponse();
      const user = await this.auth.user();

      const payload = { sub: user.id };
      const token = this.jwtService.sign(payload);
      response.cookie('jwt', token, { httpOnly: true });
    }

    return _canActivate;
  }
}
