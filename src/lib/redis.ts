import Redis from 'ioredis';

// 从环境变量获取Redis配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  db: parseInt(process.env.REDIS_DB || '0'),
  password: process.env.REDIS_PASSWORD,
};

// 创建Redis客户端单例
const redis = new Redis(redisConfig);

// 监听Redis连接事件
redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', error => {
  console.error('Redis connection error:', error);
});

// 扩展Redis方法，处理对象序列化
export const redisHelper = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  },

  async set<T>(key: string, value: T, options?: { ex?: number }): Promise<'OK'> {
    const serializedValue = JSON.stringify(value);
    if (options?.ex) {
      return redis.set(key, serializedValue, 'EX', options.ex);
    }
    return redis.set(key, serializedValue);
  },

  async del(...keys: string[]): Promise<number> {
    return redis.del(keys);
  },

  async keys(pattern: string): Promise<string[]> {
    return redis.keys(pattern);
  },
};

export default redis;
