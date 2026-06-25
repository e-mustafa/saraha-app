import { AppError } from '../error-handler/index.js';

export const throwException = (
	statusCode = 500,
	message = 'Sorry, Something went wrong.',
	context,
	errors,
	isOperational = true,
	originalError,
) => {
	throw new AppError({ statusCode, message, context, isOperational, errors, originalError });
};

export const throwInternalException = (
	message = 'Sorry, Something went wrong.',
	context,
	statusCode = 500,
	isOperational = false,
	originalError,
) => {
	throw new AppError({ statusCode, message, context, isOperational, originalError });
};

export const ValidationFieldsException = (errors, message = 'Validation fields error', statusCode = 400) => {
	throwException(statusCode, message, 'ValidationFieldsError', errors);
};

export const NotFoundException = (message = 'Not found', context = 'NotFoundException') => {
	throwException(404, message, context);
};

export const UnauthorizedException = (message = 'Unauthorized', context = 'UnauthorizedException') => {
	throwException(401, message, context);
};

export const ForbiddenException = (message = 'Forbidden', context = 'ForbiddenException') => {
	throwException(403, message, context);
};

export const BadRequestException = (message = 'Bad request', context = 'BadRequestException') => {
	throwException(400, message, context);
};

export const ConflictException = (message = 'Conflict', context = 'ConflictException', errors) => {
	throwException(409, message, context, errors);
};

export const GoneException = (message = 'Gone', context = 'GoneException') => {
	throwException(410, message, context);
};

export const PreconditionFailedException = (message = 'Precondition failed', context = 'PreconditionFailedException') => {
	throwException(412, message, context);
};

export const PayloadTooLargeException = (message = 'Payload too large', context = 'PayloadTooLargeException') => {
	throwException(413, message, context);
};

export const UnsupportedMediaTypeException = (
	message = 'Unsupported media type',
	context = 'UnsupportedMediaTypeException',
) => {
	throwException(415, message, context);
};

export const UnprocessableEntityException = (message = 'Unprocessable entity', context = 'UnprocessableEntityException') => {
	throwException(422, message, context);
};

export const TooManyRequestsException = (message = 'Too many requests', context = 'TooManyRequestsException') => {
	throwException(429, message, context);
};

export const InternalServerErrorException = (
	message = 'Internal server error',
	context = 'InternalServerErrorException',
) => {
	throwException(500, message, context);
};

export const NotImplementedException = (message = 'Not implemented', context = 'NotImplementedException') => {
	throwException(501, message, context);
};

export const BadGatewayException = (message = 'Bad gateway', context = 'BadGatewayException') => {
	throwException(502, message, context);
};

export const ServiceUnavailableException = (message = 'Service unavailable', context = 'ServiceUnavailableException') => {
	throwException(503, message, context);
};

export const GatewayTimeoutException = (message = 'Gateway timeout', context = 'GatewayTimeoutException') => {
	throwException(504, message, context);
};
