import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { Public } from 'src/core/auth.guard';
import { ArticleService } from './article.service';
import { Article } from './entities/article.entity';
import { FindManyDTO } from './dto/find-many.dto';
import { Pagination } from 'src/types/pagination';
import { CreateArticleDTO } from './dto/create-one.dto';
import { UserInfo } from 'src/types/user-info';
import type { AuthenticatedRequest } from 'src/types/authenticated-request';
import { UpdateArticleDTO } from './dto/update-one.dto';

@Controller('article')
export class ArticleController {
    constructor(
        public articleService: ArticleService
    ) {}

    @Public()
    @Get()
    async findOne(@Param(":id") id: number) : Promise<Article> {
        const result = await this.articleService.findOne(id);
        if (!result) {
            throw new NotFoundException();
        }
        return result;
    }

    @Public()
    @Get()
    async findMany(@Query() findManyDto: FindManyDTO) : Promise<Pagination<Article>> {
        return await this.articleService.findPage(findManyDto);
    }

    @Post()
    async createOne(@Body() createArticleDto: CreateArticleDTO, @Req() request: AuthenticatedRequest) : Promise<Article> {
        const authorId = (request.user as UserInfo).id;
        return await this.articleService.createOne(createArticleDto, authorId);
    } 

    @Patch()
    async updateOne(@Param(":id") id: number, @Body() updateArticleDto: UpdateArticleDTO, @Req() request: AuthenticatedRequest) : Promise<Article> {
        const authorId = (request.user as UserInfo).id;
        const article = await this.articleService.findOne(id);
        if (!article) {
            throw new NotFoundException();
        }
        if (article.author_id !== authorId) { // подразумевается, что пользователь может редактировать только свои статьи
            throw new UnauthorizedException();
        }
        return await this.articleService.updateOne(updateArticleDto, authorId);
    }

    @Delete()
    async deleteOne(@Param(":id") id: number, @Req() request: AuthenticatedRequest) {
        const authorId = (request.user as UserInfo).id;
        const article = await this.articleService.findOne(id);
        if (!article) {
            throw new NotFoundException();
        }
        if (article.author_id !== authorId) { // подразумевается, что пользователь может редактировать только свои статьи
            throw new UnauthorizedException();
        }
        await this.articleService.deleteOne(id);
    }
}
