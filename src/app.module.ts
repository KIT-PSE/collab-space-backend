import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { IsUniqueConstraint } from './common/constraints/unique';

@Module({
  imports: [MikroOrmModule.forRoot(), AuthModule, UserModule],
  providers: [AppService, IsUniqueConstraint],
})
export class AppModule {}
