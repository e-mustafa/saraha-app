import { configEnv } from './config/env.js';
import connectDB from './DB/connection.js';
import { authRouter, authRoutes } from './modules/index.js';
import { globalErrorHandler } from './utils/error-handler/index.js';
import { successResponse } from './utils/response/success.response.js';
import { throwException } from './utils/response/throw.exceptions.js';

export default async function bootstrap(app, express) {
	// middlewares
	app.use(express.json({ limit: '2mb' }));

	// connect to Database
	await connectDB();

	// base route middleware
	app.use(configEnv.urlApiBase, (_, __, next) => next()); //'/api/v1'

	app.get('/', (_, res) => {
		successResponse({ res, message: 'Hello in Saraha App Api!' });
	});

	// routers
	app.use(authRoutes.base, authRouter);

	// handle not found routes
	app.all('*all', (_, __, next) => {
		next(throwException(404, `❌ This route not exist!`));
	});

	// global error handler middleware
	app.use(globalErrorHandler);
}
