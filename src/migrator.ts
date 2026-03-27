import { DataSource } from "typeorm"
import dataSourceConfig from "./core/db"

export const AppDataSource = new DataSource(dataSourceConfig);

