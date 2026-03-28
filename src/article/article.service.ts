import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository } from 'typeorm';
import { FindManyRequestDTO } from './dto/find-many.dto';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
    ) {}

    async findOne(id: number) {
        return await this.articleRepository.findOneByOrFail({id});
    }

    async findPage(search: FindManyRequestDTO) {
        // Подразумевается, что результаты фильтруются пересечением условий 
        const {
            title,
            text,
            author,
            fromCreatedAt,
            toCreatedAt,
            page = 0,
            limit = 20
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
        query.orderBy('article.createdAt', 'DESC'); // новые статьи первее
        query.skip(limit * page); // задаем оффсет
        query.take(limit); // отрезаем лишку из селекта

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
