import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { security } from '../core/config'

@Module({
  imports: [
    UserModule,
    JwtModule.register({
        global: true,
        secret: security.jwtSecret,
        signOptions: {
            expiresIn: security.jwtExpiresIn
        }
    })
],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
