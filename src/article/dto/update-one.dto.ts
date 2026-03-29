import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateArticleDTO {

    @MaxLength(30)
    @MinLength(5)
    @IsString()
    @IsOptional()
    title?: string;
    
    @MaxLength(100000)
    @MinLength(150)
    @IsString()
    @IsOptional()
    text?: string;
}