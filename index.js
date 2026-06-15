import express from 'express';
import { configEnv } from './src/config/env.js';
import bootstrap from './src/bootstrap.js';

const app = express();

const port = configEnv.port || 4000;

await bootstrap(app, express);

// Handle synchronous uncaught exceptions (e.g., using an undefined variable)
process.on('uncaughtException', (err) => {
	console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
	console.error(err.name, err.message, err.stack);
	process.exit(1);
});

app.listen(port, () => console.log(`✔ App listening on port ${port}`));

// Handle asynchronous unhandled rejections (e.g., DB connection failure)
process.on('unhandledRejection', (err) => {
	console.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
	console.error(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});
