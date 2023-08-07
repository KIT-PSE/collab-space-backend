import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

export const jwtModuleConfig = {
  global: true,
  secret: 'secret',
  signOptions: { expiresIn: '1h' },
  verifyOptions: {
    ignoreExpiration: false,
    audience: 'collab-space.com',
  },
};

/**
 * Module handling authentication-related components.
 */
@Global()
@Module({
  imports: [UserModule, JwtModule.register(jwtModuleConfig)],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
