import { DataSourceOptions } from "typeorm";
import { db } from "./config"

export default {
    type: "postgres",
    host: db.host,
    port: db.port,
    username: db.user,
    password: db.password,
    database: db.database,
    synchronize: false, // лучше использовать миграции в дев среде, чем дропнуть прод из за невнимательности
    logging: false,
    entities: [`${__dirname}/../**/*.entity.{js,ts}`],
    migrations: [`${__dirname}/../migrations/*.{js,ts}`],
    subscribers: [],
} as DataSourceOptions;
