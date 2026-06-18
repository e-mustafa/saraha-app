export default class AppError extends Error {
	constructor({ statusCode, message, context = '', isOperational = true, errors = null, originalError = null }) {
		super(message);
		this.statusCode = statusCode || 500;
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		this.isOperational = isOperational; // Indicates this is a known, operational error
		this.context = context;

		this.errors = errors; // for validation errors

		// Attach the original error object or technical details for logging purposes
		this.originalError = originalError;

		Error.captureStackTrace(this, this.constructor);
	}
}
