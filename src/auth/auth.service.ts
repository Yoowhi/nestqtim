import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { compare, hash } from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { security } from "../core/config"
import { LoginRequestDTO } from './dto/login.dto';
import { SignupRequestDTO } from './dto/signup.dto.ts';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
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
        const payload = { sub: user.id, username: user.username };
        const {password: pwd, ...userTruncated } = user; // убираем хэш пароля из объекта, юзеру он не нужен
        return {
            user: userTruncated,
            accessToken: await this.jwtService.signAsync(payload)
        }
    }

    async signup(signupDto: SignupRequestDTO) {
        const exists = await this.userService.userExists({username: signupDto.username});
        if (exists) {
            throw new ConflictException('Username already exists');
        }
        signupDto.password = await hash(signupDto.password, security.passwordSaltRounds);
        const {password: pwd, ...userTruncated } = await this.userService.createOne(signupDto);
        const payload = { sub: userTruncated.id, username: userTruncated.username };
        return {
            user: userTruncated,
            accessToken: await this.jwtService.signAsync(payload)
        }
    }
}
