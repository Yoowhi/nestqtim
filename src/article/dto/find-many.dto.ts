import { Transform } from "class-transformer";
import { IsDate, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class FindManyRequestDTO {
    
    @IsString()
    @IsOptional()
    title?: string;
    
    @IsString()
    @IsOptional()
    text?: string;
    
    @IsString()
    @IsOptional()
    author?: string; // пользователь будет искать по юзернейму а не ID
    
    @IsDate()
    @IsOptional()
    fromCreatedAt?: Date;
    
    @IsDate()
    @IsOptional()
    toCreatedAt?: Date;

    @Min(0)
    @IsInt()
    @Transform(({ value }) => value ?? 0) // пагинация с нулевой страницы
    page: number;

    @Min(1)
    @IsInt()
    @Transform(({ value }) => value ?? 1)
    limit: number;
}