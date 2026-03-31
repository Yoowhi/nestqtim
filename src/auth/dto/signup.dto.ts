import { IsNotEmpty, IsString } from "class-validator";
import { UserInfo } from "src/types/user-info";

export class SignupRequestDTO {

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export interface SignUpResponseDTO {
    accessToken: string,
    user: UserInfo
}