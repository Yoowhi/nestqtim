import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Query } from '@nestjs/common';
import { Public } from 'src/core/auth.guard';
import { ArticleService } from './article.service';
import { Article } from './entities/article.entity';
import { FindManyRequestDTO } from './dto/find-many.dto';
import { Pagination } from 'src/types/pagination';

@Controller('article')
export class ArticleController {
    constructor(
        public articleService: ArticleService
    ) {}

    @Public()
    @HttpCode(HttpStatus.OK)
    @Get()
    async findOne(@Param(":id") id: number) : Promise<Article> {
        try {
            return await this.articleService.findOne(id);
        } catch (error) {
            throw new NotFoundException();
        }
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Get()
    async findMany(@Query() findManyDto: FindManyRequestDTO) : Promise<Pagination<Article>> {
        try {
            return await this.articleService.findPage(findManyDto);
        } catch (error) {
            throw new NotFoundException();
        }
    }
}
