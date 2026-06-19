import { isDev } from '../../config/env.js';
import AppError from './app-error.js';

const productionMsg = 'Sorry, something went wrong.';

// Helper to format error response in development mode
const sendErrorDev = (err, req, res) => {
	res.status(err.statusCode).json({
		success: false,
		statusCode: err.statusCode,
		message: err.message,
		timestamp: new Date().toISOString(),
		path: req.originalUrl, // the requested path
		errors: err.errors || undefined,
		error: {
			name: err.name,
			context: err.context,
			isOperational: err.isOperational,
			code: err.code,
			stack: err.stack,
		},
		cause: err.cause,
	});
};

// Helper to format error response in production mode
const sendErrorProduction = (err, res) => {
	res.status(err.statusCode).json({
		success: false,
		// Show original message only if it is a known operational error (if handled exception)
		message: err.isOperational ? err.message : productionMsg,
		errors: err.errors || undefined,
	});
};

// Transformer for invalid MongoDB Object ID errors (e.g., malformed ID)
const handleMongooseCastError = (err) => {
	const message = `Invalid field value for ${err.path}`;
	return new AppError({ statusCode: 400, message, context: 'invalid_field_value', errors: err.errors });
};

// Transformer for duplicate database keys (e.g., email already registered)
const handleMongooseDuplicateFields = (err) => {
	const value = Object.keys(err?.cause?.keyValue)[0];
	const message = `Duplicate field value: ${value}. Please use another value.`;
	const errors = {
		[value]: err.message || message,
	};
	return new AppError({ statusCode: 409, message, context: 'duplicate_field_value', errors });
};

// Transformer for schema validation failures (e.g., age out of bounds)
const handleMongooseValidationError = (err) => {
	const errors = {};

	// Extract field-specific validation messages
	Object.values(err.errors).forEach((el) => {
		errors[el?.properties?.path || el.path] = el.message;
	});

	const message = `Database validation failed. Please check your information.`;
	return new AppError({ statusCode: 400, message, context: 'database_validation_error', errors });
};

// Main Express global error handling middleware
export default function globalErrorHandler(err, req, res, _next) {
	// Set default values if not explicitly provided
	err.statusCode = err.statusCode || 500;
	err.isOperational = err.isOperational || false;

	// Use the original error object directly to avoid clone issues with non-enumerable properties
	let error = err;
	const cause = err.cause;

	// Check and transform specific Mongoose/MongoDB errors
	if (err.name === 'CastError') error = handleMongooseCastError(err);
	if (err.code === 11000 || cause?.code === 11000) error = handleMongooseDuplicateFields(err);
	if (err.name === 'ValidationError') error = handleMongooseValidationError(err);

	// Route error response based on the current environment
	if (isDev) {
		sendErrorDev(error, req, res);
	} else {
		sendErrorProduction(error, res);
	}
}
