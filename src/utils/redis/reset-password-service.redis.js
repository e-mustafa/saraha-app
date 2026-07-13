import { appConfig } from '../../config/app.config.js';
import { redisDB } from './client.redis.js';

export const resetPasswordServices = {
	set: async (hashedToken, userId, expiresInSeconds = appConfig	.otp.resetPassword.expiresIn) => {
		await redisDB.set(`users:reset:${hashedToken}`, userId, {
			expiration: {
				type: 'EX',
				value: expiresInSeconds, // 10 minutes
			},
		});
	},
	tll: async (hashedToken) => {
		return await redisDB.ttl(`users:reset:${hashedToken}`);
	},

	get: async (hashedToken) => {
		return await redisDB.get(`users:reset:${hashedToken}`);
	},

	delete: async (hashedToken) => {
		await redisDB.del(`users:reset:${hashedToken}`);
	},
};
