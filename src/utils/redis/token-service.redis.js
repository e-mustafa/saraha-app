import { appConfig } from '../../config/app.config.js';
import { redisDB } from './client.redis.js';

export const tokenServices = {
	set: async (userId, token, expiresInSeconds = appConfig.otp.refreshToken.expiresIn) => {
		await redisDB.set(`users:refreshTokens:${token}`, userId, {
			expiration: {
				type: 'EX',
				value: expiresInSeconds, // 7 days
			},
		});
	},
	tll: async (token) => {
		return await redisDB.ttl(`users:refreshTokens:${token}`);
	},

	get: async (token) => {
		return await redisDB.get(`users:refreshTokens:${token}`);
	},

	delete: async (token) => {
		await redisDB.del(`users:refreshTokens:${token}`);
	},
};
