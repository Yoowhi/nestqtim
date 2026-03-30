import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { RedisJsonModule } from 'src/redis-json/redis-json.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';

@Module({
  imports: [
        TypeOrmModule.forFeature([Article]),
        RedisJsonModule
    ],
    controllers: [ArticleController],
    providers: [ArticleService]
})
export class ArticleModule {}
