import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './core/auth.guard';
import dataSourceConfig from "./core/db"
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleModule } from './article/article.module';
import { redis } from './core/config';
import { RedisModule } from '@songkeys/nestjs-redis';
import { RedisJsonModule } from './redis-json/redis-json.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(dataSourceConfig),
        RedisModule.forRoot({
            config: {
                host: redis.host,
                port: redis.port,
            }
        }),
        AuthModule,
        UserModule,
        HealthModule,
        ArticleModule,
        RedisJsonModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
  ],
    
})
export class AppModule {}
