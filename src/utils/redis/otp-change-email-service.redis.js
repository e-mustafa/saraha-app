import { appConfig } from '../../config/app.config.js';
import { redisDB } from './client.redis.js';

export const changeEmailOtpServices = {
	set: async (userId, { otp, newEmail }, expiresInSeconds = appConfig.otp.changeEmail.expiresIn) => {
		await redisDB.set(`users:${userId}:email-change`, JSON.stringify({ newEmail, otp }), {
			expiration: {
				type: 'EX',
				value: expiresInSeconds, // 5 minutes
			},
		});
	},
	tll: async (userId) => {
		return await redisDB.ttl(`users:${userId}:email-change`);
	},

	get: async (userId) => {
		return await redisDB.get(`users:${userId}:email-change`);
	},

	delete: async (userId) => {
		await redisDB.del(`users:${userId}:email-change`);
	},
};
