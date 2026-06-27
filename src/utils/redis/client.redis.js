import { createClient } from 'redis';
import { configEnv } from '../../config/env.js';

export const redisDB = createClient({
	url: configEnv.db.redisUrl,
});

redisDB.on('error', (err) => console.log('Redis Client Error', err));

export async function connectRedis() {
	try {
		await redisDB.connect();
		console.log('✔ Connected to Redis successfully!');
	} catch (error) {
		console.error('❌ Error connecting to Redis:', error);
	}
}
