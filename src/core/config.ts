import { config } from 'dotenv'
import type { StringValue } from "ms";

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
}

export const security = {
    passwordSaltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS as string),
    jwtSecret: process.env.JWT_SECRET as string,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN as StringValue,
}