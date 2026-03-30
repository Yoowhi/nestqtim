import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDTO, LoginResponseDTO } from './dto/login.dto';
import { SignupRequestDTO, SignUpResponseDTO } from './dto/signup.dto';
import { Public, Refresh } from 'src/core/auth.guard';
import type { AuthenticatedRequest } from 'src/types/authenticated-request';
import type { Response } from 'express';
import ms from 'ms';
import { security } from 'src/core/config';

export const REFRESH_COOKIE_NAME = 'refreshToken';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginRequestDTO, @Res() response: Response) : Promise<LoginResponseDTO> {
        const result = await this.authService.login(loginDto);
        response.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
            httpOnly: true,
            maxAge: ms(security.jwtRefreshTokenTTL)
        });
        return result.loginResponse;
    }

    @Public()
    @Post('signup')
    async signup(@Body() logInDto: SignupRequestDTO, @Res() response: Response) : Promise<SignUpResponseDTO> {
        const result = await this.authService.signup(logInDto);
        response.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
            httpOnly: true,
            maxAge: ms(security.jwtRefreshTokenTTL)
        });
        return result.signupResponse;
    }

    @Post('logout')
    async logout(@Req() request: AuthenticatedRequest, @Res() response: Response) {
        await this.authService.logout(request.user);
        response.clearCookie(REFRESH_COOKIE_NAME);
    }

    @Refresh()
    @Post('refresh')
    async refresh(@Req() request: AuthenticatedRequest) {
        return await this.authService.refresh(request.user);
    }
}
