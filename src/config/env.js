import { configDotenv } from 'dotenv';

configDotenv();

export const configEnv = {
	appName: process.env.APP_NAME || 'Saraha App',
	port: process.env.APP_PORT,
	environment: process.env.NODE_APP,
	urlApiBase: process.env.URL_API_BASE || '/api/v2',
	frontendUrl: process.env.FRONTEND_URL,
	db: {
		dbUrl: process.env.DATABASE_URL,
		dbName: process.env.DATABASE_Name,
		redisUrl: process.env.REDIS_URL,
	},
	security: {
		salt: process.env.SALT_ROUND,
		encKey: process.env.ENCRYPTION_KEY,
		iv: process.env.IV_LENGTH,
	},
	// jwt: {
	// 	secret: process.env.ACCESS_TOKEN_SECRET,
	// 	expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
	// },
};

export const isDev = configEnv.environment == 'development';

export const jwtSignatureLevel = {
	user: {
		ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_USER_LEVEL || '',
		REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_USER_LEVEL || '',
		ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_USER_EXPIRES_IN || '15m',
		REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_USER_EXPIRES_IN || '7d',
	},
	admin: {
		ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_ADMIN_LEVEL || '',
		REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_ADMIN_LEVEL || '',
		ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_ADMIN_EXPIRES_IN || '10m',
		REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_ADMIN_EXPIRES_IN || '3d',
	},
};

export const providersAuth = {
	google: {
		clientId: process.env.GOOGLE_CLIENT_ID || '',
		clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
		redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
	},
};


export const emailConfig = {
	googleAppPassword: process.env.GOOGLE_APP_PASSWORD || '',
	googleEmail: process.env.GOOGLE_APP_EMAIL || '',
	
	// from: process.env.EMAIL_FROM || 'Saraha App <no-reply@saraha-app.com>',

	// smtp: {
	// 	host: process.env.SMTP_HOST || '',
	// 	port: process.env.SMTP_PORT || '',
	// 	secure: process.env.SMTP_SECURE || false,
	// 	auth: {
	// 		user: process.env.SMTP_USER || '',
	// 		pass: process.env.SMTP_PASS || '',
	// 	},
	// },
};



