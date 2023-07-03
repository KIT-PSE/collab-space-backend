import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from './access-token.strategy';
import { RefreshTokenStrategy } from './refresh-token.strategy';

@Global()
@Module({
  imports: [
    UserModule,
    JwtModule.register({
      //global: true,
      secret: 'secret',
      //signOptions: { expiresIn: '1h' },
      //verifyOptions: {
      //ignoreExpiration: false,
      //audience: 'collab-space.com',
      //},
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
