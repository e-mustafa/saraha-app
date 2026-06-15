import { AppError } from '../error-handler/index.js';

export const throwException = (status = 500, message = 'Sorry, Something went wrong.', errors, error) => {
	throw new AppError(status, message, errors, error);
};
