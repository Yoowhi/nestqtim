import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository } from 'typeorm';
import { FindManyDTO } from './dto/find-many.dto';
import { CreateArticleDTO } from './dto/create-one.dto';
import { UpdateArticleDTO } from './dto/update-one.dto';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
    ) {}

    async createOne(createArticleDto: CreateArticleDTO, authorId: number) {
        const article = this.articleRepository.create(createArticleDto);
        article.author_id = authorId;
        return await this.articleRepository.save(article);
    }

    async updateOne(updateArticleDto: UpdateArticleDTO, articleId: number) {
        const result = await this.articleRepository.update(articleId, updateArticleDto);
        if (result.affected === 0) {
            throw new NotFoundException();
        }
        return (await this.articleRepository.findOneBy({ id: articleId }))!;
    }

    async findOne(id: number) {
        return await this.articleRepository.findOneBy({id});
    }

    async deleteOne(id: number) {
        return await this.articleRepository.delete({id});
    }

    async findPage(search: FindManyDTO) {
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

        return {
            page: articles,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}
