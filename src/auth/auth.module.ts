import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { security } from '../core/config';
import { RedisJsonModule } from 'src/redis-json/redis-json.module';

@Module({
  imports: [
    UserModule,
    RedisJsonModule,
    JwtModule.register({
        global: true,
        secret: security.jwtSecret,
        signOptions: {
            expiresIn: security.jwtAccessTokenTTL
        }
    })
],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
