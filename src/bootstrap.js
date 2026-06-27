import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configEnv } from './config/env.js';
import connectDB from './DB/connection.js';
import { authRouter, authRoutes, userRouter, userRoutes } from './modules/index.js';
import { globalErrorHandler } from './utils/error-handler/index.js';
import { connectRedis } from './utils/redis/client.redis.js';
import { successResponse } from './utils/response/success.response.js';
import { NotFoundException } from './utils/response/throw.exceptions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function bootstrap(app, express) {
	// middlewares
	app.use(cors({ origin: configEnv.frontendUrl, credentials: true })); // for handling CORS
	app.use(express.json({ limit: '2mb' })); // for parsing JSON bodies
	app.use(cookieParser()); // for parsing cookies

	// connect to Database
	await connectDB();
	await connectRedis();

	app.get('/', (_, res) => {
		successResponse({ res, message: `Hello in ${configEnv.appName} Api!` });
	});

	// routers
	app.use('/uploads', express.static(path.join(__dirname, './uploads')));
	app.use(configEnv.urlApiBase + authRoutes.base, authRouter);
	app.use(configEnv.urlApiBase + userRoutes.base, userRouter);

	// handle not found routes
	app.all('*all', (_, __, next) => {
		next(NotFoundException('❌ This route not exist!'));
	});

	// global error handler middleware
	app.use(globalErrorHandler);
}
