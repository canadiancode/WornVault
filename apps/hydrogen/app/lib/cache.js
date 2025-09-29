import { redis } from './redis.js';
import { memoryCache } from './memory-cache.js';

/**
 * Cache utilities for API responses
 */

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  // Cache TTL (Time To Live) in seconds
  CREATORS: 300,        // 5 minutes
  POSTS: 180,           // 3 minutes
  COMMENTS: 120,        // 2 minutes
  LIKES: 60,            // 1 minute
  FOLLOWS: 300,         // 5 minutes
  TRENDING: 600,        // 10 minutes
  SEARCH: 180,          // 3 minutes
  DEFAULT: 300          // 5 minutes
};

/**
 * Generate cache key
 * @param {string} prefix - Cache key prefix
 * @param {string|Object} identifier - Unique identifier
 * @param {Object} params - Additional parameters
 * @returns {string} Cache key
 */
function generateCacheKey(prefix, identifier, params = {}) {
  const baseKey = `${prefix}:${identifier}`;
  
  if (Object.keys(params).length === 0) {
    return baseKey;
  }
  
  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  return `${baseKey}:${paramString}`;
}

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<Object|null>} Cached data or null
 */
export async function getFromCache(key) {
  try {
    // On server-side, try Redis first
    if (typeof window === 'undefined' && redis && redis.status === 'ready') {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`🚀 Redis cache hit: ${key}`);
        return JSON.parse(cached);
      }
    }

    // Always fallback to memory cache (works on both client and server)
    const cached = memoryCache.get(key);
    if (cached) {
      console.log(`📦 Memory cache hit: ${key}`);
      return cached;
    }

    return null;
  } catch (error) {
    console.error('Error getting from cache:', error);
    // Fallback to memory cache on error
    return memoryCache.get(key);
  }
}

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {Object} data - Data to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} Success status
 */
export async function setInCache(key, data, ttl = CACHE_CONFIG.DEFAULT) {
  try {
    // On server-side, try Redis first
    if (typeof window === 'undefined' && redis && redis.status === 'ready') {
      await redis.setex(key, ttl, JSON.stringify(data));
      console.log(`🚀 Redis cache set: ${key}`);
    }

    // Always set in memory cache (works on both client and server)
    memoryCache.set(key, data, ttl);
    console.log(`📦 Memory cache set: ${key}`);
    return true;
  } catch (error) {
    console.error('Error setting cache:', error);
    // Fallback to memory cache on error
    memoryCache.set(key, data, ttl);
    console.log(`📦 Memory cache fallback set: ${key}`);
    return true;
  }
}

/**
 * Delete data from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
export async function deleteFromCache(key) {
  try {
    // On server-side, try Redis first
    if (typeof window === 'undefined' && redis && redis.status === 'ready') {
      await redis.del(key);
      console.log(`🚀 Redis cache deleted: ${key}`);
    }

    // Always delete from memory cache
    memoryCache.del(key);
    console.log(`📦 Memory cache deleted: ${key}`);
    return true;
  } catch (error) {
    console.error('Error deleting from cache:', error);
    // Fallback to memory cache
    memoryCache.del(key);
    return true;
  }
}

/**
 * Delete multiple keys from cache
 * @param {string[]} keys - Array of cache keys
 * @returns {Promise<boolean>} Success status
 */
export async function deleteMultipleFromCache(keys) {
  try {
    if (!redis || redis.status !== 'ready' || keys.length === 0) {
      return false;
    }

    await redis.del(...keys);
    return true;
  } catch (error) {
    console.error('Error deleting multiple from cache:', error);
    return false;
  }
}

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Cache key pattern
 * @returns {Promise<boolean>} Success status
 */
export async function invalidateCachePattern(pattern) {
  try {
    if (!redis || redis.status !== 'ready') {
      return false;
    }

    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    console.error('Error invalidating cache pattern:', error);
    return false;
  }
}

/**
 * Cache wrapper for API functions
 * @param {string} cacheKey - Cache key
 * @param {Function} apiFunction - API function to execute
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<Object>} API response
 */
export async function withCache(cacheKey, apiFunction, ttl = CACHE_CONFIG.DEFAULT) {
  try {
    // Try to get from cache first
    const cached = await getFromCache(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return cached;
    }

    // Execute API function
    console.log(`❌ Cache miss: ${cacheKey}`);
    const result = await apiFunction();

    // Cache the result
    if (result && !result.error) {
      await setInCache(cacheKey, result, ttl);
    }

    return result;
  } catch (error) {
    console.error('Error in withCache:', error);
    // Fallback to API function if caching fails
    return await apiFunction();
  }
}

/**
 * Cache key generators for different data types
 */
export const cacheKeys = {
  // Creators
  creator: (id) => generateCacheKey('creator', id),
  creators: (page, limit) => generateCacheKey('creators', 'list', { page, limit }),
  creatorByUsername: (username) => generateCacheKey('creator', 'username', { username }),
  creatorSearch: (query) => generateCacheKey('creators', 'search', { query }),

  // Posts
  post: (id) => generateCacheKey('post', id),
  posts: (page, limit, status) => generateCacheKey('posts', 'list', { page, limit, status }),
  postsByCreator: (creatorId, page, limit) => generateCacheKey('posts', 'creator', { creatorId, page, limit }),
  trendingPosts: (limit) => generateCacheKey('posts', 'trending', { limit }),
  postSearch: (query) => generateCacheKey('posts', 'search', { query }),

  // Social
  postLikes: (postId) => generateCacheKey('likes', 'post', { postId }),
  userLikes: (userId) => generateCacheKey('likes', 'user', { userId }),
  postComments: (postId, page, limit) => generateCacheKey('comments', 'post', { postId, page, limit }),
  userFollowers: (userId, page, limit) => generateCacheKey('followers', 'user', { userId, page, limit }),
  userFollowing: (userId, page, limit) => generateCacheKey('following', 'user', { userId, page, limit }),

  // Trending
  trendingTopics: () => generateCacheKey('trending', 'topics'),
};

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  // Invalidate all creator-related cache
  invalidateCreator: async (creatorId) => {
    const patterns = [
      `creator:${creatorId}`,
      `creator:username:*`,
      `creators:list:*`,
      `creators:search:*`,
      `posts:creator:${creatorId}:*`,
    ];
    
    for (const pattern of patterns) {
      await invalidateCachePattern(pattern);
    }
  },

  // Invalidate all post-related cache
  invalidatePost: async (postId) => {
    const patterns = [
      `post:${postId}`,
      `posts:list:*`,
      `posts:trending:*`,
      `posts:search:*`,
      `likes:post:${postId}`,
      `comments:post:${postId}:*`,
    ];
    
    for (const pattern of patterns) {
      await invalidateCachePattern(pattern);
    }
  },

  // Invalidate all social cache
  invalidateSocial: async (userId, postId) => {
    const patterns = [
      `likes:user:${userId}`,
      `followers:user:${userId}:*`,
      `following:user:${userId}:*`,
    ];
    
    if (postId) {
      patterns.push(`likes:post:${postId}`, `comments:post:${postId}:*`);
    }
    
    for (const pattern of patterns) {
      await invalidateCachePattern(pattern);
    }
  },
};
