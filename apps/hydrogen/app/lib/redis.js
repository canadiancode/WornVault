/**
 * Redis client configuration
 * Only available on server-side to avoid browser compatibility issues
 */
let redis = null;

// Only initialize Redis on server-side (Node.js environment)
if (typeof window === 'undefined') {
  try {
    // Use require for server-side only
    const Redis = require('ioredis');
    
    const redisConfig = {
      host: 'localhost',
      port: 6379,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    };

    redis = new Redis(redisConfig);
    
    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('ready', () => {
      console.log('✅ Redis ready for operations');
    });

    redis.on('close', () => {
      console.log('❌ Redis connection closed');
    });

    redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    // Connect to Redis
    redis.connect().catch(console.error);
  } catch (err) {
    console.error('Failed to create Redis client:', err);
  }
}

export { redis };
