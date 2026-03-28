import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './core/auth.guard';
import dataSourceConfig from "./core/db"
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleModule } from './article/article.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(dataSourceConfig),
        AuthModule,
        UserModule,
        HealthModule,
        ArticleModule
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
