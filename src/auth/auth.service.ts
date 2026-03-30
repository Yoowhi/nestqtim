import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { compare, hash } from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { security } from "../core/config"
import { LoginRequestDTO } from './dto/login.dto';
import { SignupRequestDTO } from './dto/signup.dto';
import { RedisJsonService } from 'src/redis-json/redis-json.service';
import { UserInfo } from 'src/types/user-info';
import ms from 'ms';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly redisJsonService: RedisJsonService
    ) {}

    async login(loginDto: LoginRequestDTO) {
        const user = await this.userService.findOne({username: loginDto.username});
        if (!user) {
            throw new UnauthorizedException("User doesn't exists or password doesn't match");
        }
        const match = await compare(loginDto.password, user.password);
        if (!match) {
            throw new UnauthorizedException("User doesn't exists or password doesn't match");
        }
        const {password: pwd, ...userTruncated } = user; // убираем хэш пароля из объекта, юзеру он не нужен
        const accessToken = await this.jwtService.signAsync(userTruncated, {
            expiresIn: security.jwtAccessTokenTTL
        });
        const refreshToken = await this.jwtService.signAsync(userTruncated, {
            expiresIn: security.jwtRefreshTokenTTL
        });
        const secondsTTL = Math.trunc(ms(security.jwtRefreshTokenTTL) / 1000);
        await this.redisJsonService.set(`auth:refreshToken:${userTruncated.id}`, refreshToken, secondsTTL);
        return {
            loginResponse: {
                user: userTruncated,
                accessToken
            },
            refreshToken: refreshToken
        }
    }

    async signup(signupDto: SignupRequestDTO) {
        const exists = await this.userService.userExists({username: signupDto.username});
        if (exists) {
            throw new ConflictException('Username already exists');
        }
        signupDto.password = await hash(signupDto.password, security.passwordSaltRounds);
        const {password: pwd, ...userTruncated } = await this.userService.createOne(signupDto);
        const accessToken = await this.jwtService.signAsync(userTruncated, {
            expiresIn: security.jwtAccessTokenTTL
        });
        const refreshToken = await this.jwtService.signAsync(userTruncated, {
            expiresIn: security.jwtRefreshTokenTTL
        });
        const secondsTTL = Math.trunc(ms(security.jwtRefreshTokenTTL) / 1000);
        await this.redisJsonService.set(`auth:refreshToken:${userTruncated.id}`, refreshToken, secondsTTL);
        return {
            signupResponse: {
                user: userTruncated,
                accessToken
            },
            refreshToken: refreshToken
        }
    }

    async logout(userInfo: UserInfo) {
        await this.redisJsonService.clear(`auth:refreshToken:${userInfo.id}`);
    }

    async refresh(userInfo: UserInfo) {
        const accessToken = await this.jwtService.signAsync(userInfo, {
            expiresIn: security.jwtAccessTokenTTL
        });
        return {
            user: userInfo,
            accessToken: accessToken
        }
    }
}
