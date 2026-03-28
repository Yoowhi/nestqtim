import { Article } from "src/article/entities/article.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'user'})
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({unique: true})
    username: string;
    
    @Column()
    password: string;

    @OneToMany(() => Article, article => article.author)
    articles: Article[];
}