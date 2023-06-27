import { UserService } from '../../user/user.service';
import { CanActivate, Injectable } from '@nestjs/common';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private userService: UserService) {}

  canActivate(context: any): boolean | any | Promise<boolean | any> {
    const bearerToken =
      context.args[0].handshake.headers.authorization.split(' ')[1];
    try {
      // Todo: Adapt to our application
      const decoded = jwt.verify(bearerToken, jwtConstants.secret) as any;
      return new Promise((resolve, reject) => {
        return this.userService.findByEmail(decoded.email).then((user) => {
          if (user) {
            resolve(user);
          } else {
            reject(false);
          }
        });
      });
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}
