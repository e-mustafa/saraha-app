// globalErrorHandler.js
import { isDev } from '../../configs/env.js';
import AppError from './app-error.js';
// import AppError from './AppError.js';
// import logger from './logger.js'; // Assuming you use Winston or Pino

// Helper to format response in development mode
const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		success: false,
		// status: err.status,
		message: err.message,
		// error: err,
		// stack: err.stack,
	});
};

// Helper to format response in production mode
const sendErrorProduction = (err, res) => {
	// Operational, trusted error: send clean message to client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			success: false,
			// status: err.status,
			message: err.message, // e.g., 'api.discounts.errors.fetch_failed'
		});
	} else {
		// Programming or other unknown error: don't leak leak safety details
		res.status(500).json({
			success: false,
			// status: 'error',
			message: 'something_went_wrong',
		});
	}
};

// Specialized mappers for Mongoose errors to clean AppErrors
const handleMongooseCastError = (err) => {
	const message = `invalid_field_value_${err.path}`;
	return new AppError(400, message, err);
};

const handleMongooseDuplicateFields = (err) => {
	const value = Object.keys(err.keyValue)[0];
	const message = `duplicate_field_value_${value}`;
	return new AppError(409, message, err);
};

const handleMongooseValidationError = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message);
	const message = `validation_failed_${errors.join('_')}`;
	return new AppError(400, message, err);
};

// Main Express global error handling middleware
export default function globalErrorHandler(err, req, res, next) {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	// Log the error using your professional logger
	// It extracts originalError if it exists, or logs the default error stack
	// logger.error(err.message, {
	// 	context: err.context || 'GlobalErrorHandler',
	// 	statusCode: err.statusCode,
	// 	stack: err.stack,
	// 	originalError: err.originalError
	// 		? {
	// 				message: err.originalError.message,
	// 				stack: err.originalError.stack,
	// 				details: err.originalError,
	// 			}
	// 		: null,
	// });

	if (isDev) {
		sendErrorDev(err, res);
	} else {
		// Map database/mongoose errors specifically before sending production response
		let error = { ...err };
		error.message = err.message;
		error.isOperational = err.isOperational;

		// Handle specific Mongoose errors here if needed
		if (err.name === 'CastError') error = handleMongooseCastError(error);
		if (err.code === 11000) error = handleMongooseDuplicateFields(error);
		if (err.name === 'ValidationError') error = handleMongooseValidationError(error);

		sendErrorProduction(error, res);
	}
}
