
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserInfo } from 'src/types/user-info';
import { REFRESH_COOKIE_NAME } from 'src/auth/auth.controller';
import { RedisJsonService } from 'src/redis-json/redis-json.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_REFRESH_KEY = 'isPublic';
export const Refresh = () => SetMetadata(IS_REFRESH_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService, 
        private reflector: Reflector,
        private redisJsonService: RedisJsonService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        const refresh = this.extractRefreshToken(request);
        if (!refresh) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync<UserInfo>(refresh);
            const refreshExists = await this.redisJsonService.exists(`auth:refreshToken:${payload.id}`);
            if (!refreshExists) {
                throw new UnauthorizedException();
            }
            const isRefreshEndpoint = this.reflector.getAllAndOverride<boolean>(IS_REFRESH_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (isRefreshEndpoint) {
                request['user'] = payload;
                return true;
            }
        } catch {
            throw new UnauthorizedException();
        }

        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync<UserInfo>(token);
            request['user'] = payload;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    private extractRefreshToken(request: Request): string | undefined {
        return request.cookies[REFRESH_COOKIE_NAME];
    }
}
