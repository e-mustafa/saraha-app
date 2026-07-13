import { connect } from 'mongoose';
import { configEnv } from '../config/env.js';

export default async function connectDB() {
	try {
		console.log('mongoose db Url:', configEnv.db.dbUrl);
		await connect(configEnv.db.dbUrl, {
			// useNewUrlParser: true,
			// useUnifiedTopology: true,
			serverSelectionTimeoutMS: 5000, // Timeout for server selection (5 seconds)
		});
		console.log('✔ Connected to Database successfully!');
	} catch (error) {
		console.error('Error connecting to Database:', error);
		throw error;
		// process.exit(1);
	}
}
