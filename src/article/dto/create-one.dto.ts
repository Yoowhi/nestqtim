import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateArticleDTO {

    @MaxLength(30)
    @MinLength(5)
    @IsString()
    title: string;
    
    @MaxLength(100000)
    @MinLength(150)
    @IsString()
    text: string;
}