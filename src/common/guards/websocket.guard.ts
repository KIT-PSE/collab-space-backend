import { UserService } from '../../user/user.service';
import { CanActivate, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: any): Promise<boolean | any> {
    const bearerToken =
      context.args[0].handshake.headers.authorization.split(' ')[1];
    try {
      const token = this.jwtService.verify(bearerToken) as any;
      const user = await this.userService.findOne(token.sub);

      return !!user;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
