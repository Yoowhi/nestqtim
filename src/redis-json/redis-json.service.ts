import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';

// Через встроеннй CacheManager не выйдет красиво организовать удаление по префиксу, поэтому я сделал данную имплементацию
@Injectable()
export class RedisJsonService {
    constructor(
        @InjectRedis() 
        private readonly redis: Redis
    ) {}

    async get<T>(key: string) {
        const result = await this.redis.get(key);
        if (!result) {
            return null;
        }
        return JSON.parse(result) as T;
    }

    async set(key: string, obj: Object) {
        await this.redis.set(key, JSON.stringify(obj));
    }

    async getCacheForDto<T>(prefix: string, dto: Object): Promise<T | null> {
        const key = this.getCacheKey(prefix, dto);
        const val = await this.redis.get(key);
        if (!val) {
            return null;
        };
        return JSON.parse(val) as T;
    }

    async setCacheForDto(prefix: string, keySource: Object, obj: Object) {
        const key = this.getCacheKey(prefix, keySource);
        await this.redis.set(key, JSON.stringify(obj));
    }

    async clear(key: string) {
        await this.redis.del(key);
    }

    async clearByPrefix(prefix: string) {
        const stream = this.redis.scanStream({
            match: `${prefix}*`,
            count: 100
        });
        let keys: string[] = [];
        stream.on('data', (batch: string[]) => {
            keys = keys.concat(batch);
        });
        stream.on('end', () => {
            // позволит объединить несколько команд в один запрос
            const pipeline = this.redis.pipeline();
            for (const key of keys) {
                pipeline.del(key)
            }
            pipeline.exec();
        });
    }

    private getCacheKey(prefix: string, obj: Object) {
        // У данной имплементации есть минус
        // Вложенные объекты (если таковые будут) просто превратятся в [object Object]
        // Сортировка нужна чтобы разный порядок ключей в объекте не влиял на результат
        const sortedKeys = Object.keys(obj).sort(); // дефолтная сортировка подойдет;
        const kv = sortedKeys.map(key => `{${key}:${obj[key]}}`); // массив строк "{ключ:значение}"
        return `${prefix}:${kv.join('%%%')}`; // какой нибудь разделитель, который будет встречаться как можно реже в ожидаемых значениях
    }
}
