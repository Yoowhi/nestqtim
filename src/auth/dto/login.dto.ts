import { IsNotEmpty, IsString } from "class-validator";
import { SignUpResponseDTO } from "./signup.dto.ts";

export class LoginRequestDTO {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export interface LoginResponseDTO extends SignUpResponseDTO {};