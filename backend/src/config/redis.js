const redis = require('redis');

let redisClient = null;
let redisConnected = false;

const initRedis = async () => {
  try {
    const redisUrl = process.env.UPSTASH_REDIS_URL;
    
    if (!redisUrl) {
      console.warn('⚠ UPSTASH_REDIS_URL not configured. Using in-memory store.');
      redisConnected = false;
      return createInMemoryStore();
    }

    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          // Don't reconnect after a certain number of retries
          if (retries > 5) {
            console.warn('⚠ Redis reconnection attempts exceeded. Falling back to in-memory store.');
            return new Error('Max reconnection attempts reached');
          }
          return retries * 100;
        }
      }
    });

    // Suppress error logs but track connection state
    redisClient.on('error', (err) => {
      if (redisConnected) {
        redisConnected = false;
        console.warn('⚠ Redis connection lost. Falling back to in-memory store.');
      }
    });

    redisClient.on('connect', () => {
      redisConnected = true;
      console.log('✓ Redis connected successfully');
    });

    await redisClient.connect();
    redisConnected = true;
    return redisClient;
  } catch (error) {
    console.warn('⚠ Redis connection failed, using in-memory store:', error.message);
    redisConnected = false;
    return createInMemoryStore();
  }
};

// In-memory store for development
const inMemoryStore = new Map();

const createInMemoryStore = () => {
  return {
    set: async (key, value, ex) => {
      inMemoryStore.set(key, value);
      if (ex) {
        setTimeout(() => inMemoryStore.delete(key), ex * 1000);
      }
    },
    get: async (key) => {
      return inMemoryStore.get(key) || null;
    },
    del: async (key) => {
      inMemoryStore.delete(key);
    },
    exists: async (key) => {
      return inMemoryStore.has(key) ? 1 : 0;
    },
  };
};

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = await initRedis();
  }
  return redisClient;
};

module.exports = {
  initRedis,
  getRedisClient,
};
