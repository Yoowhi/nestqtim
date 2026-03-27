import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findOne(options: FindOptionsWhere<User>) {
        return await this.userRepository.findOne({where: options});
    }

    async createOne(newUser: Partial<User>) {
        return await this.userRepository.save(newUser);
    }

    async userExists(options: FindOptionsWhere<User>) {
        return await this.userRepository.exists({where: options});
    }
}
