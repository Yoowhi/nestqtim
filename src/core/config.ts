import { config } from 'dotenv'
import type { StringValue } from "ms";

// Поскольку мой код не использует process.env напрямую нигде кроме э того места, 
// то инициализация объектов конфига к моменту их использования гаранитрована.
// Я решил использовать это вместо ConfigService, потому что:
// 1) Мне нужен конфиг к моменту инициализации DataSourceOptions (db.ts), 
//      а он испоьзуется не только в процессе неста, но и отдельно для миграций.
// 2) Это удобнее чем ConfigService.

config({
  path: '.env'
});

export const http = {
    port: process.env.HTTP_PORT as string
};

export const db = {
    host: process.env.DB_HOST as string,
    port: parseInt(process.env.DB_PORT as string),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
};

export const security = {
    passwordSaltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS as string),
    jwtSecret: process.env.JWT_SECRET as string,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN as StringValue,
};

export const redis = {
    host: process.env.REDIS_HOST as string,
    port: parseInt(process.env.REDIS_PORT as string)
};