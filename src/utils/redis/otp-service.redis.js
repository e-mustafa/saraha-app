import { appConfig } from '../../config/app.config.js';
import { redisDB } from './client.redis.js';

export const otpServices = {
	set: async (userId, otp, expiresInSeconds = appConfig.otp.verifyEmail.expiresIn) => {
		await redisDB.set(`users:${userId}:verify_account_otp`, otp, {
			expiration: {
				type: 'EX',
				value: expiresInSeconds, // 5 minutes
			},
		});
   },
   tll: async (userId) => {
      return await redisDB.ttl(`users:${userId}:verify_account_otp`);
   },

	get: async (userId) => {
		return await redisDB.get(`users:${userId}:verify_account_otp`);
	},

	delete: async (userId) => {
		await redisDB.del(`users:${userId}:verify_account_otp`);
	},
};
