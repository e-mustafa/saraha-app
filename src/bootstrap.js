import connectDB from './DB/connection.js';
import {globalErrorHandler} from './utils/error-handler/index.js';
import { throwException } from './utils/response/throw.exceptions.js';

export default async function bootstrap(app, express) {
	// middlewares
	app.use(express.json({ limit: '2mb' }));

	// connect to Database
	await connectDB();

	// routers

	// handle not found routes
	app.all('*all', (_, __, next) => {
		next(throwException(404, `❌ This route not exist!`));
	});

	// global error handler middleware
	app.use(globalErrorHandler);
}
