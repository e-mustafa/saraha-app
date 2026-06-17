import { configDotenv } from 'dotenv';

configDotenv();

export const configEnv = {
	port: process.env.APP_PORT,
	environment: process.env.NODE_APP,
	urlApiBase: process.env.URL_API_BASE || '/api/v2',
	db: {
		dbUrl: process.env.DATABASE_URL,
		dbName: process.env.DATABASE_Name,
	},
	security: {
		salt: process.env.SALT_ROUND,
		encKey: process.env.ENCRYPTION_KEY,
		iv: process.env.IV_LENGTH,
	},
};

export const isDev = configEnv.environment == 'development';
