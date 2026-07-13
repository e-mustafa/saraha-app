import { appConfig } from '../../config/app.config.js';
import { redisDB } from './client.redis.js';

export const revertEmailTokenServices = {
	set: async (userId, { token, oldEmail }, expiresInSeconds = appConfig.otp.revertEmail.expiresIn) => {
		await redisDB.set(`users:${userId}:email-revert`, JSON.stringify({ oldEmail, token }), {
			expiration: {
				type: 'EX',
				value: expiresInSeconds, // 7 days
			},
		});
	},
	tll: async (userId) => {
		return await redisDB.ttl(`users:${userId}:email-revert`);
	},

	get: async (userId) => {
		return await redisDB.get(`users:${userId}:email-revert`);
	},

	delete: async (userId) => {
		await redisDB.del(`users:${userId}:email-revert`);
	},
};
