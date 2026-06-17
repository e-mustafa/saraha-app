import { configEnv } from './config/env.js';
import connectDB from './DB/connection.js';
import { authRouter, authRoutes, userRouter, userRoutes } from './modules/index.js';
import { globalErrorHandler } from './utils/error-handler/index.js';
import { successResponse } from './utils/response/success.response.js';
import { throwException } from './utils/response/throw.exceptions.js';
import cookieParser from 'cookie-parser';

export default async function bootstrap(app, express) {
	// middlewares
	app.use(express.json({ limit: '2mb' })); // for parsing JSON bodies
	app.use(cookieParser()); // for parsing cookies

	// connect to Database
	await connectDB();

	app.get('/', (_, res) => {
		successResponse({ res, message: 'Hello in Saraha App Api!' });
	});

	// routers
	app.use(configEnv.urlApiBase + authRoutes.base, authRouter);
	app.use(configEnv.urlApiBase + userRoutes.base, userRouter);

	// handle not found routes
	app.all('*all', (_, __, next) => {
		next(throwException(404, `❌ This route not exist!`));
	});

	// global error handler middleware
	app.use(globalErrorHandler);
}
