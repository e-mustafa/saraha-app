import { connect } from 'mongoose';
import { configEnv } from '../config/env';

export default async function connectDB() {
	try {
		await connect(configEnv.db.dbUrl, {
			// useNewUrlParser: true,
			// useUnifiedTopology: true,
			serverSelectionTimeoutMS: 5000, // Timeout for server selection (5 seconds)
		});
		console.log('✔ Connected to Database successfully!');
	} catch (error) {
		console.error('Error connecting to Database:', error);
		process.exit(1);
	}
}
