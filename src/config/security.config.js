import RedisStore from 'rate-limit-redis';
import { redisDB } from '../utils/redis/client.redis.js';
import { configEnv } from './env.js';

// CORS Configuration --------------------------------------------------------
const allowedOrigins = [configEnv.frontendUrl, ...(configEnv.allowedOrigin ? configEnv.allowedOrigin.split(',') : [])]
	.map((origin) => origin?.trim()) // Remove any accidental leading/trailing spaces
	.filter(Boolean); // Filter out undefined, null, or empty strings

export const corsConfig = {
	origin: allowedOrigins,
	credentials: true,
};

// Rate Limit Configuration --------------------------------------------------------
export const rateLimitConfig = {
	windowMs: 15 * 60 * 1000, // 15 minutes
	// max: 100, limit each IP to 100 requests per windowMs
	limit: 100, // limit each IP to 100 requests per windowMs
	standardHeaders: false,
	legacyHeaders: false,
	// statusCode: 429,
	// message: 'Too many requests, please try again later.',
	// handler: (res)=>{ res.status(426).json({message: 'Too many requests, please try again later.'})},
	// Custom handler to guarantee JSON response format
	handler: (req, res, next, options) => {
		res.status(429).json({ message: 'Too many requests, please try again later.' });
	},
	store: new RedisStore({
		sendCommand: (...args) => redisDB.sendCommand(args),
	}),
};
