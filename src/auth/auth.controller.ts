import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDTO, LoginResponseDTO } from './dto/login.dto';
import { SignupRequestDTO, SignUpResponseDTO } from './dto/signup.dto.ts';
import { Public } from 'src/core/auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginRequestDTO) : Promise<LoginResponseDTO> {
        return await this.authService.login(loginDto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('signup')
    async signup(@Body() logInDto: SignupRequestDTO) : Promise<SignUpResponseDTO> {
        return await this.authService.signup(logInDto);
    }
}
