import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configEnv } from './config/env.js';
import { corsConfig, rateLimitConfig } from './config/security.config.js';
import connectDB from './DB/connection.js';
import { authRouter, authRoutes, messageRouter, messageRoutes, userRouter, userRoutes } from './modules/index.js';
import { globalErrorHandler } from './utils/error-handler/index.js';
import { connectRedis } from './utils/redis/client.redis.js';
import { successResponse } from './utils/response/success.response.js';
import { NotFoundException } from './utils/response/throw.exceptions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function bootstrap(app, express) {
	// middlewares
	// Security ------
	app.use(cors(corsConfig)); // for handling CORS
	app.use(helmet()); // for handling security headers

	// app.use(express.urlencoded({ extended: true, limit: '2mb' })); // for parsing URL-encoded bodies
	app.use(express.json({ limit: '2mb' })); // for parsing JSON bodies
	app.use(cookieParser()); // for parsing cookies

	// connect to Database
	await connectDB();
	await connectRedis();

	app.use(rateLimit(rateLimitConfig)); // for handling rate limiting

	app.get('/', (_, res) => {
		successResponse({ res, message: `Hello in ${configEnv.appName} Api!` });
	});

	// routers
	app.use(express.static(path.join(__dirname, './public')));
	app.use('/uploads', express.static(path.join(__dirname, './uploads')));
	app.use(configEnv.urlApiBase + authRoutes.base, authRouter);
	app.use(configEnv.urlApiBase + userRoutes.base, userRouter);
	app.use(configEnv.urlApiBase + messageRoutes.base, messageRouter);

	// handle not found routes
	app.all('*all', (_, __, next) => {
		next(NotFoundException('❌ This route not exist!'));
	});

	// global error handler middleware
	app.use(globalErrorHandler);
}
