import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository } from 'typeorm';
import { FindManyDTO } from './dto/find-many.dto';
import { CreateArticleDTO } from './dto/create-one.dto';
import { UpdateArticleDTO } from './dto/update-one.dto';
import { Pagination } from 'src/types/pagination';
import { RedisJsonService } from 'src/redis-json/redis-json.service';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        private readonly redisJsonService: RedisJsonService
    ) {}

    async createOne(createArticleDto: CreateArticleDTO, authorId: number) {
        const article = this.articleRepository.create(createArticleDto);
        article.author_id = authorId;
        const result = await this.articleRepository.save(article);
        await this.redisJsonService.set(`article:one:${result.id}`, result);
        await this.redisJsonService.clearByPrefix(`article:search`);
        return result;
    }

    async updateOne(updateArticleDto: UpdateArticleDTO, articleId: number) {
        const result = await this.articleRepository.update(articleId, updateArticleDto);
        if (result.affected === 0) {
            throw new NotFoundException();
        }
        const article = (await this.articleRepository.findOneBy({ id: articleId }))!;
        await this.redisJsonService.set(`article:one:${article.id}`, article);
        await this.redisJsonService.clearByPrefix(`article:search`);
        return article;
    }

    async findOne(id: number) {
        const cache = await this.redisJsonService.get<Article>(`article:one:${id}`);
        if (cache) {
            return cache;
        }
        const result = await this.articleRepository.findOneBy({id});
        if (result) {
            await this.redisJsonService.set(`article:one:${result.id}`, result);
        }
        return result;
    }

    async deleteOne(id: number) {
        const result = await this.articleRepository.delete({id});
        const deleted = result.affected && result.affected > 0;
        if (deleted) {
            await this.redisJsonService.clear(`article:one:${id}`);
            await this.redisJsonService.clearByPrefix(`article:search`);
        }
        return deleted;
    }

    async findPage(search: FindManyDTO) {
        const cache = await this.redisJsonService.getCacheForDto<Pagination<Article>>('article:search', search);
        if (cache) {
            return cache;
        }


        // Подразумевается, что результаты фильтруются пересечением условий (AND) 
        const {
            title,
            text,
            author,
            fromCreatedAt,
            toCreatedAt,
            page = 0,
            limit = 20,
            order
        } = search;
        const query = this.articleRepository.createQueryBuilder('article');
        query.innerJoin('article.author_id', 'user')
        if (title) {
            query.andWhere("article.title LIKE :title", {title}) // экспрешн, чтоб нельзя было подсунуть sql инъекцию
        }
        if (text) {
            query.andWhere('article.text LIKE :text', {text});
        }
        if (author) {
            query.andWhere('user.username LIKE :author', {author});
        }
        if (fromCreatedAt) {
            query.andWhere('article.createdAt >= :fromCreatedAt', {fromCreatedAt});
        }
        if (toCreatedAt) {
            query.andWhere('article.createdAt <= :toCreatedAt', {toCreatedAt});
        }
        query.orderBy('article.createdAt', order);
        query.skip(limit * page); // задаем оффсет
        query.take(limit); // отрезаем лишку, получаем страницу

        const articles = await query.getMany();
        const total = await query.getCount();

        const result: Pagination<Article> = {
            page: articles,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };

        await this.redisJsonService.setCacheForDto('article:search', search, result);
        return result;
    }

    
}
