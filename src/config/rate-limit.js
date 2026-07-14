import RedisStore from 'rate-limit-redis';
import { redisDB } from '../utils/redis/client.redis.js';

export const rateLimitConfig = {
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	standardHeaders: false,
	legacyHeaders: false,
	statusCode: 429,
	message: 'Too many requests, please try again later.',
	store: new RedisStore({
		sendCommand: (...args) => redisDB.sendCommand(args),
	}),
};
