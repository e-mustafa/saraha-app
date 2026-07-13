import { createClient } from 'redis';
import { configEnv } from '../../config/env.js';

export const redisDB = createClient({
	url: configEnv.db.redisUrl,
	socket: {
		// set connection timeout to 5 seconds to prevent infinite hanging in Serverless environment
		connectTimeout: 5000,
		reconnectStrategy: (retries) => {
			// if retries > 3, throw error and stop
			if (retries > 3) {
				return new Error('❌ Redis connection failed permanently. Skipping...');
			}
			// wait a short time between attempts
			return Math.min(retries * 100, 2000);
		},
	},
});

redisDB.on('error', (err) => console.log('❌ Redis Error:', err.message));
redisDB.on('ready', () => console.log('✔ Connected to Redis successfully'));

export async function connectRedis() {
	// be sure that the client is not connected already to avoid errors in Serverless environment
	if (!redisDB.isOpen) {
		try {
			await redisDB.connect();
			console.log('✔ Redis connection initiated.');
		} catch (error) {
			console.error('❌ Failed to connect to Redis:', error.message);
			// Don't put process.exit(1) here so that the app doesn't stop completely if Redis is optional
		}
	}
}
